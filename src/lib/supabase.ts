import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Clear invalid tokens on initialization
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    // If token refresh failed, clear the session
    supabase.auth.signOut();
  }
});

// Function to clear stale authentication data
export const clearAuthData = () => {
  localStorage.removeItem(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`);
  sessionStorage.removeItem(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`);
};