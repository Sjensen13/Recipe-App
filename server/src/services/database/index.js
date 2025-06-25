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
  select: (columns = '*') => ({
    eq: (column, value) => ({
      single: () => {
        const data = mockData[tableName].find(item => item[column] === value);
        return Promise.resolve({ data, error: data ? null : { code: 'PGRST116' } });
      },
      limit: (count) => {
        const data = mockData[tableName].slice(0, count);
        return Promise.resolve({ data, error: null });
      }
    }),
    limit: (count) => {
      const data = mockData[tableName].slice(0, count);
      return Promise.resolve({ data, error: null });
    }
  }),
  insert: (data) => ({
    select: () => ({
      single: async () => {
        const newItems = Array.isArray(data) ? data : [data];
        newItems.forEach(item => {
          if (tableName === 'users') {
            item.id = mockData[tableName].length + 1;
            item.created_at = new Date().toISOString();
            item.updated_at = new Date().toISOString();
          }
          mockData[tableName].push(item);
        });
        await saveMockData(); // Persist data
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