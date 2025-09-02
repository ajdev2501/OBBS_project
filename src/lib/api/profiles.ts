import { supabase } from '../supabase';
import type { Profile } from '../../types/database';

export const getProfile = async (userId: string) => {
  // Add retry logic for profile fetching
  let retries = 3;
  let data, error;
  
  while (retries > 0) {
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    data = result.data;
    error = result.error;
    
    if (!error || error.code !== '42P17') break;
    
    retries--;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getDonorStats = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('blood_group, city')
    .eq('role', 'donor');

  if (error) throw error;
  return data;
};