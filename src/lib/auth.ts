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
        emailRedirectTo: undefined,
      },
    });

    if (error) throw error;

    // Create profile after successful signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: userData.full_name,
          phone: userData.phone || null,
          city: userData.city || null,
          blood_group: userData.blood_group as any || null,
        });

      if (profileError) throw profileError;
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

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

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