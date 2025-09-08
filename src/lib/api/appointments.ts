import { supabase } from '../supabase';
import type { Appointment } from '../../types/database';

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAppointments = async (donorId?: string) => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      donor:profiles!donor_id(full_name, phone, blood_group)
    `)
    .order('appointment_date', { ascending: true });

  if (donorId) {
    query = query.eq('donor_id', donorId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUpcomingAppointments = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      donor:profiles!donor_id(full_name, phone, blood_group)
    `)
    .gte('appointment_date', today)
    .in('status', ['scheduled', 'confirmed'])
    .order('appointment_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const confirmAppointment = async (appointmentId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};