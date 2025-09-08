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
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) throw error;

    // Only create profile if user was actually created (not just pending email confirmation)
    if (data.user && !data.user.email_confirmed_at) {
      // For email confirmation disabled, create profile immediately
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: userData.full_name,
          role: 'donor',
          phone: userData.phone || null,
          city: userData.city || null,
          blood_group: userData.blood_group as any || null,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here as the user account was created successfully
        // The profile can be created later when they first sign in
      }
    } else if (data.user && data.user.email_confirmed_at) {
      // User is already confirmed, create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: userData.full_name,
          role: 'donor',
          phone: userData.phone || null,
          city: userData.city || null,
          blood_group: userData.blood_group as any || null,
        });

      if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
        console.error('Profile creation error:', profileError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
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
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Fetch user profile with error handling
  let profile = null;
  try {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error);
    } else {
      profile = profileData;
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
  }

  return {
    ...user,
    profile: profile || undefined,
  };
};

export const getUserRole = (user: AuthUser | null): 'public' | 'donor' | 'admin' => {
  if (!user || !user.profile) return 'public';
  return user.profile.role;
};

export const checkDonorEligibility = (lastDonationDate: string | null): boolean => {
  if (!lastDonationDate) return true;
  
  const lastDonation = new Date(lastDonationDate);
  const now = new Date();
  const daysDifference = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDifference >= 90;
};