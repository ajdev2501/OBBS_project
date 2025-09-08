import { supabase } from '../supabase';
import type { Donation } from '../../types/database';

export const createDonation = async (donation: Omit<Donation, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getDonations = async (donorId?: string) => {
  let query = supabase
    .from('donations')
    .select(`
      *,
      appointment:appointments(appointment_date, donation_center),
      donor:profiles!donor_id(full_name, blood_group)
    `)
    .order('donation_date', { ascending: false });

  if (donorId) {
    query = query.eq('donor_id', donorId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getDonationStats = async (donorId?: string) => {
  let query = supabase
    .from('donations')
    .select('volume_ml, donation_date');

  if (donorId) {
    query = query.eq('donor_id', donorId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const totalDonations = data?.length || 0;
  const totalVolume = data?.reduce((sum, donation) => sum + donation.volume_ml, 0) || 0;
  const lastDonation = data?.[0]?.donation_date || null;

  return {
    totalDonations,
    totalVolume,
    lastDonation,
    donations: data || [],
  };
};

export const completeDonation = async (appointmentId: string, donationData: {
  volume_ml: number;
  bag_id?: string;
}) => {
  try {
    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError) throw appointmentError;

    // Create donation record
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        appointment_id: appointmentId,
        donor_id: appointment.donor_id,
        donation_date: new Date().toISOString().split('T')[0],
        volume_ml: donationData.volume_ml,
        bag_id: donationData.bag_id || null,
      })
      .select()
      .single();

    if (donationError) throw donationError;

    // Update appointment status
    await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId);

    // Update donor's last donation date
    await supabase
      .from('profiles')
      .update({ last_donation_date: donation.donation_date })
      .eq('id', appointment.donor_id);

    return donation;
  } catch (error) {
    console.error('Error completing donation:', error);
    throw error;
  }
};