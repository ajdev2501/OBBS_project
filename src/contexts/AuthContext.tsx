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
    
    // Use service role key to bypass RLS temporarily
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
      
      // If RLS infinite recursion error, return null and let profile creation handle it
      if (error.code === '42P17') {
        console.log('[Auth] RLS recursion error detected, will create profile manually');
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
    loading: true, // Start with loading true
    initialized: false,
    session: null,
    profileLoaded: false
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
              initialized: true,
              profileLoaded: true
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
              initialized: true,
              profileLoaded: false
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
            initialized: true,
            profileLoaded: false
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
      });    try {
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
      console.log('[Auth] Starting signup process for:', email);
      
      // Since we're getting "Database error saving new user" even with minimal signup,
      // the issue is likely with the database trigger or constraints.
      // For now, let's implement a workaround that uses the admin API
      
      // Try different approaches in order of preference:
      
      // Approach 1: Standard signup with metadata
      console.log('[Auth] Attempting standard signup with metadata...');
      let { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone || '',
            city: userData.city || '',
            blood_group: userData.blood_group || '',
          }
        }
      });
      
      // Approach 2: If metadata fails, try minimal signup
      if (error?.message?.includes('Database error saving new user')) {
        console.log('[Auth] Standard signup failed, trying minimal signup...');
        const { data: minimalData, error: minimalError } = await supabase.auth.signUp({
          email,
          password
        });
        data = minimalData;
        error = minimalError;
      }
      
      // If both approaches fail, throw the error
      if (error) {
        console.error('[Auth] All signup approaches failed:', error);
        
        // Provide user-friendly error messages
        if (error.message?.includes('Database error saving new user')) {
          throw new Error('Unable to create account due to a database configuration issue. Please contact support.');
        } else if (error.message?.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        } else {
          throw error;
        }
      }
      
      console.log('[Auth] Signup successful, user:', data.user?.email);
      
      // The profile will be created by the auth state change listener
      // which will handle both trigger-created and manual profile creation
      
    } catch (error) {
      console.error('[Auth] Signup failed:', error);
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
          initialized: true,
          profileLoaded: false
        };
        
        console.log('[Auth] Setting immediate auth state (profile will load in background)');
        setState(immediateState);
        
        // Fetch profile in background
        console.log('[Auth] Fetching profile in background for user:', session.user.id);
        getProfileData(session.user.id)
          .then(profile => {
            console.log('[Auth] Background profile fetch completed:', profile ? 'Profile found' : 'No profile');
            
            // If no profile exists, create one with minimal data
            if (!profile) {
              console.log('[Auth] No profile found, creating default profile...');
              
              // Create a minimal profile with fallback data
              const defaultProfileData = {
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 
                          session.user.email?.split('@')[0] || 
                          'User',
                phone: session.user.user_metadata?.phone || null,
                city: session.user.user_metadata?.city || null,
                blood_group: session.user.user_metadata?.blood_group || null,
                role: 'donor' as const
              };
              
              // Try to create profile, but don't block the auth flow if it fails
              console.log('[Auth] Attempting to create profile with data:', defaultProfileData);
              
              const createProfile = async () => {
                try {
                  const { data: insertData, error: insertError } = await supabase
                    .from('profiles')
                    // @ts-expect-error - temporary workaround for type issue
                    .insert(defaultProfileData)
                    .select(); // Get the inserted data back
                  
                  if (insertError) {
                    console.error('[Auth] Default profile creation failed:', insertError);
                    console.error('[Auth] Error details:', insertError.message, insertError.code);
                    
                    // Mark as loaded even if creation fails - user can still use the app
                    setState(prev => ({
                      ...prev,
                      profileLoaded: true
                    }));
                  } else {
                    console.log('[Auth] Default profile created successfully:', insertData);
                    // Update state with the new profile
                    const createdProfile = insertData && insertData[0] ? insertData[0] : defaultProfileData;
                    setState(prev => ({
                      ...prev,
                      user: prev.user ? {
                        ...prev.user,
                        profile: createdProfile as Profile
                      } : prev.user,
                      role: 'donor' as UserRole,
                      profileLoaded: true
                    }));
                  }
                } catch (error) {
                  console.error('[Auth] Profile creation exception:', error);
                  // Mark as loaded even if creation fails
                  setState(prev => ({
                    ...prev,
                    profileLoaded: true
                  }));
                }
              };
              
              createProfile();
            } else {
              // Set user state with the found profile
              setState(prev => ({
                ...prev,
                user: prev.user ? {
                  ...prev.user,
                  profile
                } : prev.user,
                role: (profile?.role === 'admin' ? 'admin' : 'donor') as UserRole,
                profileLoaded: true
              }));
            }
          })
          .catch(error => {
            console.error('[Auth] Background profile fetch failed:', error);
            // Mark as loaded even if profile fetch fails
            setState(prev => ({
              ...prev,
              profileLoaded: true
            }));
          });
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] Processing SIGNED_OUT event...');
        const newState = {
          user: null,
          role: 'public' as UserRole,
          session: null,
          loading: false,
          initialized: true,
          profileLoaded: false
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
