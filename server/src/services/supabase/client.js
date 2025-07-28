const { createClient } = require('@supabase/supabase-js');
const { getSupabase } = require('../database');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;

// Check if we have valid Supabase credentials
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_project_url' && supabaseUrl.startsWith('https://')) {
  // Use service key for server-side operations
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  // Use the mock database from the database service
  console.log('⚠️  Using mock Supabase client for development');
  supabase = getSupabase();
}

module.exports = { supabase }; 