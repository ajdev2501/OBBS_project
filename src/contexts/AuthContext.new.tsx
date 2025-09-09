import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

const createAuthUser = async (user: User): Promise<AuthUser> => {
  const profile = await getProfileData(user.id);
  return {
    id: user.id,
    email: user.email || '',
    profile
  };
};

const getUserRole = (user: AuthUser | null): UserRole => {
  if (!user?.profile) return 'public';
  return user.profile.role === 'admin' ? 'admin' : 'donor';
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: 'public',
    loading: true,
    initialized: false,
    session: null
  });

  // Initialize auth state
  const refreshProfile = useCallback(async () => {
    if (!state.user?.id) return;
    
    try {
      const profile = await getProfileData(state.user.id);
      const updatedUser = { ...state.user, profile };
      const role = getUserRole(updatedUser);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        role
      }));
    } catch (error) {
      console.error('[Auth] Profile refresh error:', error);
    }
  }, [state.user]);

  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      // State will be updated via auth state change listener
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
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

  // Effects
  useEffect(() => {
    let mounted = true;
    let initialized = false;
    
    // Set up timeout for initialization
    const timeoutId = setTimeout(() => {
      if (mounted && !initialized) {
        console.warn('[Auth] Initialization timeout');
        setState(prev => ({
          ...prev,
          loading: false,
          initialized: true
        }));
        initialized = true;
      }
    }, 10000);

    // Initialize auth
    const init = async () => {
      if (!mounted) return;
      
      try {
        console.log('[Auth] Initializing...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Session error:', error);
          if (mounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              initialized: true,
              session: null,
              user: null,
              role: 'public'
            }));
            initialized = true;
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('[Auth] Found existing session');
          const authUser = await createAuthUser(session.user);
          const role = getUserRole(authUser);
          
          if (mounted) {
            setState(prev => ({
              ...prev,
              user: authUser,
              role,
              session,
              loading: false,
              initialized: true
            }));
            initialized = true;
            
            console.log('[Auth] User initialized:', { role, hasProfile: !!authUser.profile });
          }
        } else if (mounted) {
          console.log('[Auth] No active session');
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
            session: null,
            user: null,
            role: 'public'
          }));
          initialized = true;
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
            session: null,
            user: null,
            role: 'public'
          }));
          initialized = true;
        }
      }
    };

    init();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Wait for initialization before processing auth changes
      if (!mounted || !initialized) return;
      
      console.log('[Auth] State change:', event, !!session);
      
      try {
        if (session?.user) {
          const authUser = await createAuthUser(session.user);
          const role = getUserRole(authUser);
          
          if (mounted) {
            setState(prev => ({
              ...prev,
              user: authUser,
              role,
              session,
              loading: false
            }));
            
            console.log('[Auth] User updated:', { role, hasProfile: !!authUser.profile });
          }
        } else if (mounted) {
          setState(prev => ({
            ...prev,
            user: null,
            role: 'public',
            session: null,
            loading: false
          }));
          
          console.log('[Auth] User signed out');
        }
      } catch (error) {
        console.error('[Auth] State change error:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: null,
            role: 'public',
            session: null,
            loading: false
          }));
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // Initialize only once

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
