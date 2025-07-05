import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Add logging for debugging
console.log('[Supabase] URL:', supabaseUrl);
if (supabaseAnonKey) {
  console.log('[Supabase] Anon Key exists:', true, '| First 8 chars:', supabaseAnonKey.slice(0, 8) + '...');
} else {
  console.warn('[Supabase] Anon Key missing!');
}

// Create a mock client if environment variables are missing
let supabase;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url' || supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('Missing or invalid Supabase environment variables. Authentication will not work properly.');
  console.warn('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file');
  console.warn('You can get these from your Supabase project dashboard at https://supabase.com');
  
  // Create a mock client that throws errors when used
  supabase = {
    auth: {
      getSession: () => Promise.reject(new Error('Supabase not configured - please set up your environment variables')),
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured - please set up your environment variables')),
      signUp: () => Promise.reject(new Error('Supabase not configured - please set up your environment variables')),
      signOut: () => Promise.reject(new Error('Supabase not configured - please set up your environment variables')),
      resetPasswordForEmail: () => Promise.reject(new Error('Supabase not configured - please set up your environment variables')),
      updateUser: () => Promise.reject(new Error('Supabase not configured - please set up your environment variables')),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getUser: () => Promise.reject(new Error('Supabase not configured - please set up your environment variables')),
      refreshSession: () => Promise.reject(new Error('Supabase not configured - please set up your environment variables'))
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase }; 