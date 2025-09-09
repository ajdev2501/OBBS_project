import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

export type UserRole = 'admin' | 'donor' | 'public';

// Helper function to create an AuthUser from Supabase User
export const createAuthUser = async (user: User): Promise<AuthUser> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }
    
    return {
      id: user.id,
      email: user.email || '',
      profile: profile || null
    };
  } catch (error) {
    console.error('Error creating auth user:', error);
    return {
      id: user.id,
      email: user.email || '',
      profile: null
    };
  }
};

// Get user role from AuthUser
export const getUserRole = (user: AuthUser | null): UserRole => {
  if (!user?.profile) return 'public';
  return user.profile.role === 'admin' ? 'admin' : 'donor';
};

// Auth operations
export const authOperations = {
  // Sign in
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Sign up
  signUp: async (
    email: string, 
    password: string, 
    userData: {
      full_name: string;
      phone?: string;
      city?: string;
      blood_group?: string;
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
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
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }
      
      return await createAuthUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Refresh user profile
  refreshProfile: async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Profile not found
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  }
};
