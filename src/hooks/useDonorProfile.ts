import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns';
import { ProfileSchema } from '../lib/validation';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../lib/api/profiles';
import { checkDonorEligibility } from '../lib/auth';
import { useToast } from '../components/ui/Toast';
import { bloodGroups } from '../lib/validation';
import type { BloodGroup } from '../types/database';

interface ProfileFormData {
  full_name: string;
  phone?: string;
  city?: string;
  blood_group?: BloodGroup;
  date_of_birth?: string;
  last_donation_date?: string;
  notify_email?: boolean;
}

interface EligibilityInfo {
  isEligible: boolean;
  nextEligibleDate: Date | null;
  daysSinceLastDonation: number | null;
  daysUntilEligible: number | null;
}

interface UseDonorProfileReturn {
  // Form management
  form: ReturnType<typeof useForm<ProfileFormData>>;
  handleUpdateProfile: (data: ProfileFormData) => Promise<void>;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Eligibility
  eligibilityInfo: EligibilityInfo;
  
  // Options
  bloodGroupOptions: Array<{ value: string; label: string }>;
  
  // Profile stats
  profileCompleteness: number;
  missingFields: string[];
  
  // Actions
  refetch: () => Promise<void>;
}

export const useDonorProfile = (): UseDonorProfileReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      city: '',
      blood_group: undefined,
      date_of_birth: '',
      last_donation_date: '',
      notify_email: false,
    },
  });

  const { reset } = form;

  // Load user data into form
  const loadUserData = useCallback(() => {
    if (user?.profile) {
      reset({
        full_name: user.profile.full_name || '',
        phone: user.profile.phone || '',
        city: user.profile.city || '',
        blood_group: user.profile.blood_group || undefined,
        date_of_birth: user.profile.date_of_birth || '',
        last_donation_date: user.profile.last_donation_date || '',
        notify_email: user.profile.notify_email || false,
      });
    }
  }, [user, reset]);

  // Load data when user changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Calculate eligibility information
  const eligibilityInfo = useMemo((): EligibilityInfo => {
    const lastDonationDate = user?.profile?.last_donation_date;
    const isEligible = checkDonorEligibility(lastDonationDate || null);
    
    let nextEligibleDate: Date | null = null;
    let daysSinceLastDonation: number | null = null;
    let daysUntilEligible: number | null = null;

    if (lastDonationDate) {
      const lastDate = new Date(lastDonationDate);
      const today = new Date();
      
      daysSinceLastDonation = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      nextEligibleDate = addDays(lastDate, 90);
      
      if (!isEligible) {
        daysUntilEligible = Math.ceil((nextEligibleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    return {
      isEligible,
      nextEligibleDate,
      daysSinceLastDonation,
      daysUntilEligible,
    };
  }, [user?.profile?.last_donation_date]);

  // Blood group options
  const bloodGroupOptions = useMemo(() => [
    { value: '', label: 'Select Blood Group' },
    ...bloodGroups.map(group => ({ value: group, label: group })),
  ], []);

  // Calculate profile completeness
  const profileCompleteness = useMemo(() => {
    if (!user?.profile) return 0;
    
    const fields = [
      user.profile.full_name,
      user.profile.phone,
      user.profile.city,
      user.profile.blood_group,
      user.profile.date_of_birth,
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }, [user?.profile]);

  // Get missing fields
  const missingFields = useMemo(() => {
    if (!user?.profile) return [];
    
    const fields = [
      { key: 'phone', label: 'Phone Number', value: user.profile.phone },
      { key: 'city', label: 'City', value: user.profile.city },
      { key: 'blood_group', label: 'Blood Group', value: user.profile.blood_group },
      { key: 'date_of_birth', label: 'Date of Birth', value: user.profile.date_of_birth },
    ];
    
    return fields
      .filter(field => !field.value || field.value.trim() === '')
      .map(field => field.label);
  }, [user?.profile]);

  // Handle profile update
  const handleUpdateProfile = useCallback(async (data: ProfileFormData) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Transform empty date strings to null for database compatibility
      const sanitizedData = {
        ...data,
        date_of_birth: data.date_of_birth?.trim() === '' ? null : data.date_of_birth,
        last_donation_date: data.last_donation_date?.trim() === '' ? null : data.last_donation_date,
      };

      await updateProfile(user.id, sanitizedData);
      await refreshProfile();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshProfile, showToast]);

  // Refetch user data
  const refetch = useCallback(async () => {
    try {
      await refreshProfile();
      loadUserData();
    } catch (err) {
      console.error('Error refetching user data:', err);
      setError('Failed to refresh user data');
    }
  }, [refreshProfile, loadUserData]);

  return {
    form,
    handleUpdateProfile,
    loading,
    error,
    eligibilityInfo,
    bloodGroupOptions,
    profileCompleteness,
    missingFields,
    refetch,
  };
};
