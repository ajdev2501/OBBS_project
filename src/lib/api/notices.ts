import { supabase } from '../supabase';
import type { Notice } from '../../types/database';

export const getActiveNotices = async () => {
  const { data, error } = await supabase
    .from('notices')
    .select(`
      *,
      created_by_profile:profiles!created_by(full_name)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllNotices = async () => {
  const { data, error } = await supabase
    .from('notices')
    .select(`
      *,
      created_by_profile:profiles!created_by(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createNotice = async (notice: Omit<Notice, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('notices')
    .insert(notice)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateNotice = async (id: string, updates: Partial<Notice>) => {
  const { data, error } = await supabase
    .from('notices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteNotice = async (id: string) => {
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id);

  if (error) throw error;
};