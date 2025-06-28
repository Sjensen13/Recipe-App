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
  hashtags: []
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
            
            return Promise.resolve({ data: result, error: null });
          }
          
          return Promise.resolve({ data, error: null });
        }
      }),
      limit: (count) => {
        const data = mockData[tableName].slice(0, count);
        return Promise.resolve({ data, error: null });
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
          count: mockData[tableName].length
        });
      }
    };
  },
  range: (start, end) => {
    let data = mockData[tableName].slice(start, end + 1);
    
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
      count: mockData[tableName].length
    });
  },
  insert: (data) => ({
    select: () => ({
      single: async () => {
        const newItems = Array.isArray(data) ? data : [data];
        newItems.forEach(item => {
          if (tableName === 'posts') {
            item.id = mockData[tableName].length + 1;
            item.created_at = new Date().toISOString();
            item.updated_at = new Date().toISOString();
          }
          mockData[tableName].push(item);
        });
        await saveMockData(); // Persist data
        
        // For posts, return with user data
        if (tableName === 'posts' && newItems.length === 1) {
          const post = newItems[0];
          const result = { ...post };
          
          // Add user data
          const user = mockData.users.find(u => u.id === post.user_id);
          result.users = user || null;
          
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
        const index = mockData[tableName].findIndex(item => item[column] === value);
        if (index !== -1) {
          mockData[tableName][index] = {
            ...mockData[tableName][index],
            ...updateData,
            updated_at: new Date().toISOString()
          };
          await saveMockData(); // Persist data
          
          // For posts, return with user data
          if (tableName === 'posts') {
            const post = mockData[tableName][index];
            const result = { ...post };
            
            // Add user data
            const user = mockData.users.find(u => u.id === post.user_id);
            result.users = user || null;
            
            return Promise.resolve({ data: result, error: null });
          }
          
          return Promise.resolve({ 
            data: mockData[tableName][index], 
            error: null 
          });
        }
        return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
      }
    })
  }),
  delete: () => ({
    eq: async (column, value) => {
      const index = mockData[tableName].findIndex(item => item[column] === value);
      if (index !== -1) {
        mockData[tableName].splice(index, 1);
        await saveMockData(); // Persist data
      }
      return Promise.resolve({ data: null, error: null });
    }
  })
});

const connectDatabase = async () => {
  try {
    // Check if we're in development mode and Supabase is not configured
    if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url')) {
      console.log('⚠️  Running in development mode without Supabase - using persistent mock database');
      console.log('📝 To use real database, update SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
      
      // Load existing mock data
      await loadMockData();
      
      // Create a mock supabase client for development
      supabase = {
        from: (tableName) => createMockTable(tableName),
        auth: {
          signUp: () => Promise.resolve({ data: null, error: null }),
          signInWithPassword: () => Promise.resolve({ data: null, error: null }),
          signOut: () => Promise.resolve({ error: null })
        }
      };
      
      console.log('✅ Persistent mock database connected successfully');
      return supabase;
    }

    // Real Supabase connection
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

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
    
    console.log('✅ Database connected successfully');
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