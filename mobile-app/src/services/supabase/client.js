import { createClient } from '@supabase/supabase-js';

// For React Native, we need to use environment variables or hardcode the values
// In a real app, you'd use react-native-dotenv or similar
const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your actual Supabase URL
const supabaseAnonKey = 'your-anon-key'; // Replace with your actual Supabase anon key

// Add logging for debugging
console.log('[Mobile Supabase] URL:', supabaseUrl);
if (supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') {
  console.log('[Mobile Supabase] Anon Key exists:', true, '| First 8 chars:', supabaseAnonKey.slice(0, 8) + '...');
} else {
  console.warn('[Mobile Supabase] Anon Key missing!');
}

// Create a mock client if environment variables are missing
let supabase;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.warn('Missing or invalid Supabase environment variables. Authentication will not work properly.');
  console.warn('Please update the supabaseUrl and supabaseAnonKey in mobile-app/src/services/supabase/client.js');
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