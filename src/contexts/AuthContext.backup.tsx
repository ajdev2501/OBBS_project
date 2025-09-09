import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, getUserRole } from '../lib/auth';
import type { AuthUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  role: 'public' | 'donor' | 'admin';
  loading: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      return null;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchUserProfile = async (): Promise<AuthUser | null> => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
        return currentUser;
      } catch (error) {
        console.error('Error refreshing user:', error);
        if (mounted) {
          setUser(null);
        }
        return null;
      }
    };

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && !initialized) {
            console.warn('Auth initialization timeout, setting initialized to true');
            setInitialized(true);
            setLoading(false);
          }
        }, 10000); // 10 second timeout

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setUser(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log('Found existing session, fetching user profile...');
          // User is logged in, fetch their profile
          const currentUser = await fetchUserProfile();
          if (mounted) {
            console.log('User initialized:', currentUser?.profile?.role || 'no profile');
          }
        } else if (mounted) {
          console.log('No active session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    // Initialize auth on mount
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.id);
      
      // Don't set loading during initialization to avoid conflicts
      if (initialized) {
        setLoading(true);
      }
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, fetch their profile
          console.log('Processing sign in...');
          const currentUser = await fetchUserProfile();
          if (mounted && currentUser) {
            console.log('User signed in:', currentUser.profile?.role || 'no profile');
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear state
          if (mounted) {
            setUser(null);
            console.log('User signed out');
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token refreshed, update user data silently
          console.log('Token refreshed, updating user data...');
          await fetchUserProfile();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted && initialized) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [initialized]); // Only depend on initialized state

  // Don't compute role until user is loaded
  const role = getUserRole(user);

  const value = {
    user,
    role,
    loading: loading && !initialized,
    refreshUser,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};