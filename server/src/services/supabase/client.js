const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;

// Check if we have valid Supabase credentials
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_project_url' && supabaseUrl.startsWith('https://')) {
  // Use service key for server-side operations
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  // Fallback to mock client for development
  console.log('⚠️  Using mock Supabase client for development');
  supabase = {
    auth: {
      getUser: (token) => Promise.resolve({ 
        data: { 
          user: { 
            id: '74ff4ba9-0a8b-47d8-b5c5-20c8e5ca1b0f',
            email: 'test@example.com',
            user_metadata: {}
          } 
        }, 
        error: null 
      })
    }
  };
}

module.exports = { supabase }; 