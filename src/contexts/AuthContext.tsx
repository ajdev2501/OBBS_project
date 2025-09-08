import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, getUserRole } from '../lib/auth';
import type { AuthUser } from '../lib/auth';
import { supabase, clearAuthData } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  role: 'public' | 'donor' | 'admin';
  loading: boolean;
  refreshUser: () => Promise<void>;
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

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session error:', error);
          clearAuthData();
          setUser(null);
          return;
        }
        
        if (session?.user) {
          await refreshUser();
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await refreshUser();
      } else if (event === 'TOKEN_REFRESHED' && !session) {
        setUser(null);
      }
      
      if (loading) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }
  )

  const role = getUserRole(user);

  const value = {
    user,
    role,
    loading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};