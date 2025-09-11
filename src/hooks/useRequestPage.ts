import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../lib/api/requests';
import { getActiveNotices } from '../lib/api/notices';
import { useToast } from '../components/ui/Toast';
import type { Notice, BloodGroup } from '../types/database';

interface RequestFormData {
  requester_name: string;
  phone: string;
  email: string;
  blood_group: BloodGroup;
  quantity_units: number;
  hospital: string;
  city: string;
  urgency: 'low' | 'medium' | 'high';
}

interface User {
  id: string;
  email: string;
  profile?: {
    full_name?: string;
    phone?: string | null;
    city?: string | null;
    blood_group?: BloodGroup | null;
  } | null;
}

interface UseRequestPageReturn {
  loading: boolean;
  notices: (Notice & { created_by_profile: { full_name: string } })[];
  noticesLoading: boolean;
  submitRequest: (data: RequestFormData) => Promise<void>;
  getInitialData: (user: User | null) => Partial<RequestFormData> | undefined;
  urgencyInfo: {
    low: { color: string; description: string; estimatedTime: string };
    medium: { color: string; description: string; estimatedTime: string };
    high: { color: string; description: string; estimatedTime: string };
  };
  tips: string[];
}

export const useRequestPage = (user: User | null): UseRequestPageReturn => {
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<(Notice & { created_by_profile: { full_name: string } })[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Load relevant notices
  const loadNotices = useCallback(async () => {
    try {
      setNoticesLoading(true);
      const noticesData = await getActiveNotices();
      setNotices((noticesData as (Notice & { created_by_profile: { full_name: string } })[]) || []);
    } catch (error) {
      console.error('Error loading notices:', error);
    } finally {
      setNoticesLoading(false);
    }
  }, []);

  // Load notices on hook initialization
  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const submitRequest = useCallback(async (data: RequestFormData) => {
    setLoading(true);
    try {
      await createRequest({
        ...data,
        status: 'pending',
        created_by: user?.id || null,
      });
      
      showToast('Blood request submitted successfully! Our team will contact you soon.', 'success');
      
      // Navigate with state to show confirmation
      navigate('/', { 
        state: { 
          message: 'Your blood request has been submitted successfully!',
          type: 'success'
        }
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      showToast('Failed to submit request. Please check your information and try again.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate, showToast]);

  // Pre-fill form data if user is authenticated
  const getInitialData = useCallback((currentUser: User | null): Partial<RequestFormData> | undefined => {
    if (!currentUser?.profile) return undefined;
    
    return {
      requester_name: currentUser.profile.full_name || '',
      phone: currentUser.profile.phone || '',
      email: currentUser.email || '',
      city: currentUser.profile.city || '',
      blood_group: currentUser.profile.blood_group || undefined,
      urgency: 'medium', // Default to medium
      quantity_units: 1, // Default to 1 unit
    };
  }, []);

  // Memoized urgency information
  const urgencyInfo = useMemo(() => ({
    low: {
      color: 'text-green-700 bg-green-50 border-green-200',
      description: 'Non-urgent medical procedures, elective surgeries',
      estimatedTime: '2-7 days'
    },
    medium: {
      color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      description: 'Planned surgeries, ongoing treatments',
      estimatedTime: '24-48 hours'
    },
    high: {
      color: 'text-red-700 bg-red-50 border-red-200',
      description: 'Emergency situations, critical patients',
      estimatedTime: '2-6 hours'
    }
  }), []);

  // Helpful tips for requesters
  const tips = useMemo(() => [
    'Provide accurate contact information for faster response',
    'Include hospital reference number if available',
    'Specify exact blood type needed for better matching',
    'For emergencies, call our 24/7 hotline: 1-800-BLOOD',
    'Consider reaching out to family and friends as potential donors',
    'Multiple smaller requests may be fulfilled faster than large ones'
  ], []);

  return {
    loading,
    notices,
    noticesLoading,
    submitRequest,
    getInitialData,
    urgencyInfo,
    tips
  };
};
