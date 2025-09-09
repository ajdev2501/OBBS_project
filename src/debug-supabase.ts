import { supabase } from './lib/supabase';

// Test Supabase connection
const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if client is created
    console.log('Supabase client created:', !!supabase);
    
    // Test 2: Try to get session
    console.log('Getting session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session result:', { session: !!session, error: sessionError });
    
    // Test 3: Try a simple query (this might fail if user is not authenticated, but should still connect)
    console.log('Testing database connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    console.log('Database test result:', { data, error });
    
  } catch (error) {
    console.error('Supabase connection test failed:', error);
  }
};

// Add to window for debugging
(window as any).testSupabase = testSupabaseConnection;

console.log('Supabase test function added to window. Run: window.testSupabase()');
