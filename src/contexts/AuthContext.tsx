import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

// Types
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

export type UserRole = 'admin' | 'donor' | 'public';

interface AuthState {
  user: AuthUser | null;
  role: UserRole;
  loading: boolean;
  initialized: boolean;
  session: Session | null;
  profileLoaded: boolean; // Add this to track if profile fetch is complete
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: {
    full_name: string;
    phone?: string;
    city?: string;
    blood_group?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper functions
const getProfileData = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('[Auth] Starting profile fetch for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('[Auth] Profile query completed');
    console.log('[Auth] Profile data:', data);
    console.log('[Auth] Profile error:', error);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[Auth] Profile not found (PGRST116) for user:', userId);
        return null;
      }
      console.error('[Auth] Profile fetch error:', error);
      // Don't throw, return null to continue auth flow
      return null;
    }
    
    console.log('[Auth] Profile fetched successfully:', !!data);
    return data;
  } catch (error) {
    console.error('[Auth] Exception in profile fetch:', error);
    // Don't throw, return null to continue auth flow
    return null;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: 'public',
    loading: false,
    initialized: false,
    session: null
  });

  console.log('[AuthProvider] Current state:', {
    hasUser: !!state.user,
    userEmail: state.user?.email,
    role: state.role,
    loading: state.loading,
    initialized: state.initialized,
    hasSession: !!state.session
  });

  // Simple initialization - just check if we have a session
  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        console.log('[Auth] Checking for existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (cancelled) return;

        if (session?.user) {
          console.log('[Auth] Found session, loading profile...');
          const profile = await getProfileData(session.user.id);
          
          if (!cancelled) {
            setState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                profile
              },
              role: profile?.role === 'admin' ? 'admin' : 'donor',
              session,
              loading: false,
              initialized: true
            });
          }
        } else {
          console.log('[Auth] No session found');
          if (!cancelled) {
            setState({
              user: null,
              role: 'public',
              session: null,
              loading: false,
              initialized: true
            });
          }
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        if (!cancelled) {
          setState({
            user: null,
            role: 'public',
            session: null,
            loading: false,
            initialized: true
          });
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[Auth] signIn called with email:', email);
    setState(prev => {
      console.log('[Auth] Setting loading to true');
      return { ...prev, loading: true };
    });
    
    try {
      console.log('[Auth] Calling supabase.auth.signInWithPassword...');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('[Auth] signInWithPassword error:', error);
        throw error;
      }
      
      console.log('[Auth] signInWithPassword successful, waiting for auth state change...');
      // State will be updated via auth state change listener
    } catch (error) {
      console.error('[Auth] signIn catch block:', error);
      setState(prev => {
        console.log('[Auth] Setting loading to false due to error');
        return { ...prev, loading: false };
      });
      throw error;
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData: {
      full_name: string;
      phone?: string;
      city?: string;
      blood_group?: string;
    }
  ) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone || null,
            city: userData.city || null,
            blood_group: userData.blood_group || null,
          }
        }
      });
      
      if (error) throw error;
      // State will be updated via auth state change listener
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // State will be updated via auth state change listener
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      // Force local state reset even if signOut fails
      setState(prev => ({
        ...prev,
        user: null,
        role: 'public',
        session: null,
        loading: false
      }));
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user?.id) return;
    
    try {
      const profile = await getProfileData(state.user.id);
      if (profile) {
        setState(prev => prev.user ? {
          ...prev,
          user: { ...prev.user, profile },
          role: profile.role === 'admin' ? 'admin' : 'donor'
        } : prev);
      }
    } catch (error) {
      console.error('[Auth] Profile refresh error:', error);
    }
  }, [state.user]);

  // Auth state change listener - simplified
  useEffect(() => {
    console.log('[Auth] Setting up auth state change listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state change event:', event);
      console.log('[Auth] Session data:', session ? 'Session exists' : 'No session');
      console.log('[Auth] User data:', session?.user ? `User: ${session.user.email}` : 'No user');
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[Auth] Processing SIGNED_IN event...');
        
        // Immediately set user as authenticated, then fetch profile in background
        const immediateState = {
          user: {
            id: session.user.id,
            email: session.user.email || '',
            profile: null // Will be updated after profile fetch
          },
          role: 'donor' as UserRole, // Default role, will be updated after profile fetch
          session,
          loading: false, // Don't block on profile fetch
          initialized: true
        };
        
        console.log('[Auth] Setting immediate auth state (profile will load in background)');
        setState(immediateState);
        
        // Fetch profile in background
        console.log('[Auth] Fetching profile in background for user:', session.user.id);
        getProfileData(session.user.id)
          .then(profile => {
            console.log('[Auth] Background profile fetch completed:', profile ? 'Profile found' : 'No profile');
            
            setState(prev => ({
              ...prev,
              user: prev.user ? {
                ...prev.user,
                profile
              } : prev.user,
              role: (profile?.role === 'admin' ? 'admin' : 'donor') as UserRole
            }));
          })
          .catch(error => {
            console.error('[Auth] Background profile fetch failed:', error);
            // Keep the current state, profile remains null
          });
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] Processing SIGNED_OUT event...');
        const newState = {
          user: null,
          role: 'public' as UserRole,
          session: null,
          loading: false,
          initialized: true
        };
        
        console.log('[Auth] Setting signed out state');
        setState(newState);
      } else {
        console.log('[Auth] Ignoring auth event:', event);
      }
    });

    console.log('[Auth] Auth state change listener setup complete');
    return () => {
      console.log('[Auth] Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
