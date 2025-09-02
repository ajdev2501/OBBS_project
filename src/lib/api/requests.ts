import { supabase } from '../supabase';
import type { BloodRequest } from '../../types/database';

export const createRequest = async (request: Omit<BloodRequest, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('requests')
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRequests = async (userId?: string) => {
  let query = supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('created_by', userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data;
};

export const updateRequestStatus = async (id: string, status: BloodRequest['status']) => {
  const { data, error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fulfillRequest = async (requestId: string, inventoryIds: string[]) => {
  // Start transaction-like operations
  const { error: updateRequestError } = await supabase
    .from('requests')
    .update({ status: 'fulfilled' })
    .eq('id', requestId);

  if (updateRequestError) throw updateRequestError;

  // Update inventory status to fulfilled
  const { error: updateInventoryError } = await supabase
    .from('inventory')
    .update({ status: 'fulfilled' })
    .in('id', inventoryIds);

  if (updateInventoryError) throw updateInventoryError;

  // Create allocations
  const allocations = inventoryIds.map(inventoryId => ({
    request_id: requestId,
    inventory_id: inventoryId,
  }));

  const { error: allocationError } = await supabase
    .from('allocations')
    .insert(allocations);

  if (allocationError) throw allocationError;

  return true;
};