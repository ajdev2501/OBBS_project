import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

export interface AuthUser extends User {
  profile?: Profile;
}

export const signUp = async (email: string, password: string, userData: {
  full_name: string;
  phone?: string;
  city?: string;
  blood_group?: string;
}) => {
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

  // The profile will be created via database trigger
  // or we can handle it in the auth state change listener
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth user error:', error);
      return null;
    }
    
    if (!user) return null;

    // Fetch user profile with better error handling
    let profile = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // If profile doesn't exist, this is an edge case
        // The profile should be created during registration
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found for authenticated user');
          // Return user without profile - they'll need to complete registration
        }
      } else {
        profile = profileData;
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
    }

    return {
      ...user,
      profile: profile || undefined,
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
};

export const getUserRole = (user: AuthUser | null): 'public' | 'donor' | 'admin' => {
  if (!user || !user.profile) return 'public';
  return user.profile.role;
};

export const getRoleBasedRedirectPath = (role: 'public' | 'donor' | 'admin'): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'donor':
      return '/donor';
    default:
      return '/';
  }
};

export const checkDonorEligibility = (lastDonationDate: string | null): boolean => {
  if (!lastDonationDate) return true;
  
  const lastDonation = new Date(lastDonationDate);
  const now = new Date();
  const daysDifference = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDifference >= 90;
};