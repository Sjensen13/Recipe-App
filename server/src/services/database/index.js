const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
let mockDataPath = path.join(__dirname, '../../../../mock-data.json');

// Mock database data
let mockData = {
  users: [],
  posts: [],
  comments: [],
  likes: [],
  messages: [],
  recipes: [],
  hashtags: [],
  conversations: [],
  conversation_participants: []
};

// Load mock data from file
const loadMockData = async () => {
  try {
    const data = await fs.readFile(mockDataPath, 'utf8');
    mockData = JSON.parse(data);
    console.log('📁 Loaded mock data from file');
  } catch (error) {
    // File doesn't exist or is invalid, start with empty data
    console.log('📁 No existing mock data found, starting fresh');
    await saveMockData();
  }
};

// Save mock data to file
const saveMockData = async () => {
  try {
    console.log('💾 Saving mock data to:', mockDataPath);
    console.log('💾 Data to save:', JSON.stringify(mockData, null, 2));
    await fs.writeFile(mockDataPath, JSON.stringify(mockData, null, 2));
    console.log('✅ Mock data saved successfully');
  } catch (error) {
    console.error('❌ Failed to save mock data:', error);
  }
};

// Enhanced mock database methods
const createMockTable = (tableName) => ({
  select: (columns = '*') => {
    // Parse the select string to understand what to return
    const isComplexSelect = typeof columns === 'string' && columns.includes('(');
    
    return {
      eq: (column, value) => ({
        single: () => {
          const data = mockData[tableName].find(item => item[column] === value);
          if (!data) {
            return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
          }
          
          if (isComplexSelect) {
            // Handle complex selects with joins
            const result = { ...data };
            
            // Add related data based on the select string
            if (columns.includes('users!posts_user_id_fkey')) {
              const user = mockData.users.find(u => u.id === data.user_id);
              result.users = user || null;
            }
            
            if (columns.includes('likes')) {
              result.likes = mockData.likes.filter(like => like.post_id === data.id) || [];
            }
            
            if (columns.includes('comments')) {
              const comments = mockData.comments.filter(comment => comment.post_id === data.id) || [];
              // Add user data to comments if requested
              if (columns.includes('users!comments_user_id_fkey')) {
                result.comments = comments.map(comment => ({
                  ...comment,
                  users: mockData.users.find(u => u.id === comment.user_id) || null
                }));
              } else {
                result.comments = comments;
              }
            }
            
            // Handle conversations with participants and messages
            if (tableName === 'conversations' && columns.includes('participants')) {
              const participants = mockData.conversation_participants.filter(p => p.conversation_id === data.id);
              result.participants = participants.map(p => ({
                ...p,
                users: mockData.users.find(u => u.id === p.user_id) || null
              }));
            }
            
            if (tableName === 'conversations' && columns.includes('last_message')) {
              const messages = mockData.messages.filter(m => m.conversation_id === data.id);
              const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
              if (lastMessage) {
                result.last_message = [{
                  ...lastMessage,
                  users: mockData.users.find(u => u.id === lastMessage.sender_id) || null
                }];
              } else {
                result.last_message = [];
              }
            }
            
            // Handle messages with sender
            if (tableName === 'messages' && columns.includes('sender')) {
              result.sender = mockData.users.find(u => u.id === data.sender_id) || null;
            }
            
            // Handle recipes with user data
            if (tableName === 'recipes' && columns.includes('user')) {
              const user = mockData.users.find(u => u.id === data.user_id);
              result.user = user || null;
            }
            
            return Promise.resolve({ data: result, error: null });
          }
          
          return Promise.resolve({ data, error: null });
        }
      }),
      or: (condition) => {
        // Handle OR conditions for conversations
        if (tableName === 'conversations' && condition.includes('participants.user_id.eq.')) {
          // Updated regex to handle UUID strings
          const userId = condition.match(/participants\.user_id\.eq\.([^)]+)/)?.[1];
          if (userId) {
            const participantConversations = mockData.conversation_participants
              .filter(p => p.user_id === userId)
              .map(p => p.conversation_id);
            
            const conversations = mockData.conversations.filter(c => 
              participantConversations.includes(c.id)
            );
            
            // Return an object that supports order method
            return {
              order: (column, options = {}) => {
                const { ascending = true } = options;
                let sortedData = [...conversations];
                
                // Sort the data
                sortedData.sort((a, b) => {
                  const aVal = a[column];
                  const bVal = b[column];
                  
                  if (ascending) {
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                  } else {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                  }
                });
                
                // Handle complex selects with joins for conversations
                if (isComplexSelect && tableName === 'conversations') {
                  sortedData = sortedData.map(conv => {
                    const result = { ...conv };
                    
                    // Add participants with user data
                    if (columns.includes('participants')) {
                      const participants = mockData.conversation_participants.filter(p => p.conversation_id === conv.id);
                      result.participants = participants.map(p => ({
                        ...p,
                        users: mockData.users.find(u => u.id === p.user_id) || null
                      }));
                    }
                    
                    // Add last message with sender data
                    if (columns.includes('last_message')) {
                      const messages = mockData.messages.filter(m => m.conversation_id === conv.id);
                      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                      if (lastMessage) {
                        result.last_message = [{
                          ...lastMessage,
                          users: mockData.users.find(u => u.id === lastMessage.sender_id) || null
                        }];
                      } else {
                        result.last_message = [];
                      }
                    }
                    
                    return result;
                  });
                }
                
                return Promise.resolve({ data: sortedData, error: null });
              }
            };
          }
        }
        
        return Promise.resolve({ data: [], error: null });
      },
      eq: (column, value) => {
        const filteredData = mockData[tableName].filter(item => item[column] === value);
        
        return {
          order: (column, options = {}) => {
            const { ascending = true } = options;
            let data = [...filteredData];
            
            // Sort the data
            data.sort((a, b) => {
              const aVal = a[column];
              const bVal = b[column];
              
              if (ascending) {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
              } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
              }
            });
            
            // Handle complex selects with joins for recipes
            if (isComplexSelect && tableName === 'recipes') {
              data = data.map(recipe => {
                const result = { ...recipe };
                
                // Add user data
                if (columns.includes('user')) {
                  const user = mockData.users.find(u => u.id === recipe.user_id);
                  result.user = user || null;
                }
                
                return result;
              });
            }
            
            return {
              range: (start, end) => {
                const rangedData = data.slice(start, end + 1);
                return Promise.resolve({ data: rangedData, error: null });
              }
            };
          }
        };
      },
      or: (condition) => {
        // Handle search conditions for recipes
        if (tableName === 'recipes' && condition.includes('title.ilike.') && condition.includes('description.ilike.')) {
          const searchTerm = condition.match(/\.ilike\.%([^%]+)%/)?.[1];
          if (searchTerm) {
            const filteredData = mockData[tableName].filter(recipe => 
              recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            return {
              order: (column, options = {}) => {
                const { ascending = true } = options;
                let data = [...filteredData];
                
                // Sort the data
                data.sort((a, b) => {
                  const aVal = a[column];
                  const bVal = b[column];
                  
                  if (ascending) {
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                  } else {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                  }
                });
                
                // Handle complex selects with joins for recipes
                if (isComplexSelect && tableName === 'recipes') {
                  data = data.map(recipe => {
                    const result = { ...recipe };
                    
                    // Add user data
                    if (columns.includes('user')) {
                      const user = mockData.users.find(u => u.id === recipe.user_id);
                      result.user = user || null;
                    }
                    
                    return result;
                  });
                }
                
                return {
                  range: (start, end) => {
                    const rangedData = data.slice(start, end + 1);
                    return Promise.resolve({ data: rangedData, error: null });
                  }
                };
              }
            };
          }
        }
        
        // For any other OR condition, just return all data
        return {
          order: (column, options = {}) => {
            const { ascending = true } = options;
            let data = [...mockData[tableName]];
            
            // Sort the data
            data.sort((a, b) => {
              const aVal = a[column];
              const bVal = b[column];
              
              if (ascending) {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
              } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
              }
            });
            
            // Handle complex selects with joins for recipes
            if (isComplexSelect && tableName === 'recipes') {
              data = data.map(recipe => {
                const result = { ...recipe };
                
                // Add user data
                if (columns.includes('user')) {
                  const user = mockData.users.find(u => u.id === recipe.user_id);
                  result.user = user || null;
                }
                
                return result;
              });
            }
            
            return {
              range: (start, end) => {
                const rangedData = data.slice(start, end + 1);
                return Promise.resolve({ data: rangedData, error: null });
              }
            };
          }
        };
      },
      limit: (count) => {
        const data = mockData[tableName].slice(0, count);
        return Promise.resolve({ data, error: null });
      },
      order: (column, options = {}) => {
        const { ascending = true } = options;
        let data = [...mockData[tableName]];
        
        // Sort the data
        data.sort((a, b) => {
          const aVal = a[column];
          const bVal = b[column];
          
          if (ascending) {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          }
        });
        
        // Handle complex selects with joins for recipes
        if (isComplexSelect && tableName === 'recipes') {
          data = data.map(recipe => {
            const result = { ...recipe };
            
            // Add user data
            if (columns.includes('user')) {
              const user = mockData.users.find(u => u.id === recipe.user_id);
              result.user = user || null;
            }
            
            return result;
          });
        }
        
        return {
          range: (start, end) => {
            const rangedData = data.slice(start, end + 1);
            return Promise.resolve({ data: rangedData, error: null });
          }
        };
      },
      contains: (column, value) => {
        // Filter data based on array containment
        let filteredData = mockData[tableName];
        
        if (column === 'hashtags' && Array.isArray(value)) {
          const hashtagToFind = value[0]; // Get the hashtag from the array
          filteredData = mockData[tableName].filter(item => 
            item.hashtags && Array.isArray(item.hashtags) && item.hashtags.includes(hashtagToFind)
          );
        }
        
        return {
          order: (column, options = {}) => {
            const { ascending = true } = options;
            return {
              range: (start, end) => {
                let data = [...filteredData];
                
                // Sort the data
                data.sort((a, b) => {
                  const aVal = a[column];
                  const bVal = b[column];
                  
                  if (ascending) {
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                  } else {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                  }
                });
                
                // Apply range
                data = data.slice(start, end + 1);
                
                // Handle complex selects with joins
                const isComplexSelect = true; // Assume complex select for posts
                if (isComplexSelect && tableName === 'posts') {
                  data = data.map(post => {
                    const result = { ...post };
                    
                    // Add user data
                    const user = mockData.users.find(u => u.id === post.user_id);
                    result.users = user || null;
                    
                    // Add likes
                    result.likes = mockData.likes.filter(like => like.post_id === post.id) || [];
                    
                    // Add comments with user data
                    const comments = mockData.comments.filter(comment => comment.post_id === post.id) || [];
                    result.comments = comments.map(comment => ({
                      ...comment,
                      users: mockData.users.find(u => u.id === comment.user_id) || null
                    }));
                    
                    return result;
                  });
                }
                
                return Promise.resolve({ 
                  data, 
                  error: null,
                  count: filteredData.length
                });
              }
            };
          },
          range: (start, end) => {
            let data = filteredData.slice(start, end + 1);
            
            // Handle complex selects with joins for posts
            if (tableName === 'posts') {
              data = data.map(post => {
                const result = { ...post };
                
                // Add user data
                const user = mockData.users.find(u => u.id === post.user_id);
                result.users = user || null;
                
                // Add likes
                result.likes = mockData.likes.filter(like => like.post_id === post.id) || [];
                
                // Add comments with user data
                const comments = mockData.comments.filter(comment => comment.post_id === post.id) || [];
                result.comments = comments.map(comment => ({
                  ...comment,
                  users: mockData.users.find(u => u.id === comment.user_id) || null
                }));
                
                return result;
              });
            }
            
            return Promise.resolve({ 
              data, 
              error: null,
              count: filteredData.length
            });
          }
        };
      }
    };
  },
  order: (column, options = {}) => {
    const { ascending = true } = options;
    return {
      range: (start, end) => {
        let data = [...mockData[column]];
        
        // Sort the data
        data.sort((a, b) => {
          const aVal = a[column];
          const bVal = b[column];
          
          if (ascending) {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          }
        });
        
        // Apply range
        data = data.slice(start, end + 1);
        
        // Handle complex selects with joins
        const isComplexSelect = true; // Assume complex select for posts
        if (isComplexSelect && column === 'posts') {
          data = data.map(post => {
            const result = { ...post };
            
            // Add user data
            const user = mockData.users.find(u => u.id === post.user_id);
            result.users = user || null;
            
            // Add likes
            result.likes = mockData.likes.filter(like => like.post_id === post.id) || [];
            
            // Add comments with user data
            const comments = mockData.comments.filter(comment => comment.post_id === post.id) || [];
            result.comments = comments.map(comment => ({
              ...comment,
              users: mockData.users.find(u => u.id === comment.user_id) || null
            }));
            
            return result;
          });
        }
        
        return Promise.resolve({ 
          data, 
          error: null,
          count: mockData[column].length
        });
      }
    };
  },
  range: (start, end) => {
    let data = mockData[column].slice(start, end + 1);
    
    // Handle complex selects with joins for posts
    if (column === 'posts') {
      data = data.map(post => {
        const result = { ...post };
        
        // Add user data
        const user = mockData.users.find(u => u.id === post.user_id);
        result.users = user || null;
        
        // Add likes
        result.likes = mockData.likes.filter(like => like.post_id === post.id) || [];
        
        // Add comments with user data
        const comments = mockData.comments.filter(comment => comment.post_id === post.id) || [];
        result.comments = comments.map(comment => ({
          ...comment,
          users: mockData.users.find(u => u.id === comment.user_id) || null
        }));
        
        return result;
      });
    }
    
    return Promise.resolve({ 
      data, 
      error: null,
      count: mockData[column].length
    });
  },
  insert: (data) => ({
    select: (columns = '*') => ({
      single: async () => {
        const newItems = Array.isArray(data) ? data : [data];
        newItems.forEach(item => {
          // Generate ID for new items
          item.id = mockData[tableName].length + 1;
          
          // Add timestamps
          if (tableName === 'posts' || tableName === 'conversations' || tableName === 'messages' || tableName === 'recipes') {
            item.created_at = new Date().toISOString();
            item.updated_at = new Date().toISOString();
          }
          
          mockData[tableName].push(item);
        });
        await saveMockData(); // Persist data
        
        // Handle complex selects for different tables
        if (newItems.length === 1) {
          const item = newItems[0];
          const result = { ...item };
          
          // Add user data for posts
          if (tableName === 'posts') {
            const user = mockData.users.find(u => u.id === item.user_id);
            result.users = user || null;
          }
          
          // Add user data for recipes
          if (tableName === 'recipes' && columns.includes('user')) {
            const user = mockData.users.find(u => u.id === item.user_id);
            result.user = user || null;
          }
          
          // Add sender data for messages
          if (tableName === 'messages' && columns.includes('sender')) {
            result.sender = mockData.users.find(u => u.id === item.sender_id) || null;
          }
          
          return Promise.resolve({ data: result, error: null });
        }
        
        return Promise.resolve({ 
          data: newItems.length === 1 ? newItems[0] : newItems, 
          error: null 
        });
      }
    })
  }),
  update: (updateData) => ({
    eq: (column, value) => ({
      select: async () => {
        const index = mockData[column].findIndex(item => item[column] === value);
        if (index !== -1) {
          mockData[column][index] = {
            ...mockData[column][index],
            ...updateData,
            updated_at: new Date().toISOString()
          };
          await saveMockData(); // Persist data
          
          // For posts, return with user data
          if (column === 'posts') {
            const post = mockData[column][index];
            const result = { ...post };
            
            // Add user data
            const user = mockData.users.find(u => u.id === post.user_id);
            result.users = user || null;
            
            return Promise.resolve({ data: result, error: null });
          }
          
          return Promise.resolve({ 
            data: mockData[column][index], 
            error: null 
          });
        }
        return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
      }
    }),
    is: (column, value) => ({
      select: async () => {
        // Handle IS NULL queries
        if (value === null) {
          const items = mockData[column].filter(item => item[column] === null || item[column] === undefined);
          items.forEach(item => {
            const index = mockData[column].findIndex(i => i.id === item.id);
            if (index !== -1) {
              mockData[column][index] = {
                ...mockData[column][index],
                ...updateData,
                updated_at: new Date().toISOString()
              };
            }
          });
          await saveMockData();
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }
    })
  }),
  delete: () => ({
    eq: async (column, value) => {
      const index = mockData[column].findIndex(item => item[column] === value);
      if (index !== -1) {
        mockData[column].splice(index, 1);
        await saveMockData(); // Persist data
      }
      return Promise.resolve({ data: null, error: null });
    },
    or: (condition) => {
      // Handle OR conditions for conversations
      if (column === 'conversations' && condition.includes('participants.user_id.eq.')) {
        const userId = condition.match(/participants\.user_id\.eq\.(\d+)/)?.[1];
        if (userId) {
          const participantConversations = mockData.conversation_participants
            .filter(p => p.user_id === parseInt(userId))
            .map(p => p.conversation_id);
          
          const conversations = mockData.conversations.filter(c => 
            participantConversations.includes(c.id)
          );
          
          return Promise.resolve({ data: conversations, error: null });
        }
      }
      
      return Promise.resolve({ data: [], error: null });
    }
  })
});

const connectDatabase = async () => {
  try {
    // Check if we have valid Supabase credentials
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url' && supabaseUrl.startsWith('https://')) {
      console.log('🔗 Connecting to real Supabase database...');
      
      supabase = createClient(supabaseUrl, supabaseKey);

      // Test the connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        throw error;
      }
      
      console.log('✅ Real Supabase database connected successfully');
      return supabase;
    }

    // Fallback to mock database if no valid credentials
    console.log('⚠️  Running in development mode without valid Supabase credentials - using persistent mock database');
    console.log('📝 To use real database, update SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
    
    // Load existing mock data
    await loadMockData();
    
    // Create a mock supabase client for development
    supabase = {
      from: (tableName) => createMockTable(tableName),
      auth: {
        signUp: () => Promise.resolve({ data: null, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: (token) => {
          // Mock authentication for development
          return Promise.resolve({ 
            data: { 
              user: { 
                id: '74ff4ba9-0a8b-47d8-b5c5-20c8e5ca1b0f',
                email: 'test@example.com',
                user_metadata: {}
              } 
            }, 
            error: null 
          });
        },
        getSession: () => {
          // Mock session for development
          return Promise.resolve({ 
            data: { 
              session: { 
                access_token: 'mock-token',
                user: { 
                  id: '74ff4ba9-0a8b-47d8-b5c5-20c8e5ca1b0f',
                  email: 'test@example.com',
                  user_metadata: {}
                }
              } 
            }, 
            error: null 
          });
        },
        refreshSession: () => {
          // Mock session refresh for development
          return Promise.resolve({ 
            data: { 
              session: { 
                access_token: 'mock-refreshed-token',
                user: { 
                  id: '74ff4ba9-0a8b-47d8-b5c5-20c8e5ca1b0f',
                  email: 'test@example.com',
                  user_metadata: {}
                }
              } 
            }, 
            error: null 
          });
        }
      }
    };
    
    console.log('✅ Persistent mock database connected successfully');
    return supabase;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

function getSupabase() {
  return supabase;
}

module.exports = {
  connectDatabase,
  getSupabase
}; 