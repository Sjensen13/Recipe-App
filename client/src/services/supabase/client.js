import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are missing
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Authentication will not work properly.');
  console.warn('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file');
  
  // Create a mock client that throws errors when used
  supabase = {
    auth: {
      getSession: () => Promise.reject(new Error('Supabase not configured')),
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.reject(new Error('Supabase not configured')),
      resetPasswordForEmail: () => Promise.reject(new Error('Supabase not configured')),
      updateUser: () => Promise.reject(new Error('Supabase not configured')),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase }; 