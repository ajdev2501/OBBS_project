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
      // Only log non-policy errors to avoid spam
      if (error && (error as any).code !== '42P17') {
        console.error('Error fetching user:', error);
      }
      setUser(null);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session error:', error);
          clearAuthData();
          setUser(null);
          setLoading(false);
          return;
        }
        await refreshUser();
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        await refreshUser();
      }
      setLoading(false);
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