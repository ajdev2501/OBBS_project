import { supabase } from '../supabase';
import type { InventoryItem, BloodGroup } from '../../types/database';

export const getAvailability = async (bloodGroup?: BloodGroup, city?: string) => {
  let query = supabase
    .from('inventory')
    .select(`
      blood_group,
      profiles!created_by(city)
    `)
    .eq('status', 'available')
    .gte('expires_on', new Date().toISOString().split('T')[0]);

  if (bloodGroup) {
    query = query.eq('blood_group', bloodGroup);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Aggregate by blood group and city
  const aggregated: Record<string, Record<string, number>> = {};
  
  data?.forEach((item) => {
    const group = item.blood_group;
    const itemCity = item.profiles?.city || 'Unknown';
    
    if (!aggregated[group]) aggregated[group] = {};
    if (!aggregated[group][itemCity]) aggregated[group][itemCity] = 0;
    aggregated[group][itemCity]++;
  });

  return aggregated;
};

export const getInventoryItems = async (isAdmin = false) => {
  let query = supabase
    .from('inventory')
    .select(`
      *,
      created_by_profile:profiles!created_by(full_name)
    `)
    .order('expires_on', { ascending: true });

  if (!isAdmin) {
    query = query.eq('status', 'available');
  }

  const { data, error } = await query;
  if (error) throw error;

  return data as (InventoryItem & { 
    created_by_profile: { full_name: string } 
  })[];
};

export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('inventory')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getUnitsForAllocation = async (bloodGroup: BloodGroup, quantity: number) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('blood_group', bloodGroup)
    .eq('status', 'available')
    .gte('expires_on', new Date().toISOString().split('T')[0])
    .order('expires_on', { ascending: true })
    .limit(Math.max(quantity, 10)); // Get more units than needed for better allocation

  if (error) throw error;
  return data;
};

export const discardExpiredUnits = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('inventory')
    .update({ status: 'discarded' })
    .eq('status', 'available')
    .lt('expires_on', today)
    .select();

  if (error) throw error;
  return data;
};