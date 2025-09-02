import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema } from '../../lib/validation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../lib/api/profiles';
import { checkDonorEligibility } from '../../lib/auth';
import { useToast } from '../../components/ui/Toast';
import { bloodGroups } from '../../lib/validation';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';

export const DonorProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(ProfileSchema),
  });

  useEffect(() => {
    if (user?.profile) {
      reset({
        full_name: user.profile.full_name,
        phone: user.profile.phone || '',
        city: user.profile.city || '',
        blood_group: user.profile.blood_group || '',
        last_donation_date: user.profile.last_donation_date || '',
        notify_email: user.profile.notify_email,
      });
    }
  }, [user, reset]);

  const handleUpdateProfile = async (data: any) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await updateProfile(user.id, data);
      await refreshUser();
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroupOptions = [
    { value: '', label: 'Select Blood Group' },
    ...bloodGroups.map(group => ({ value: group, label: group })),
  ];

  const isEligible = checkDonorEligibility(user?.profile?.last_donation_date || null);
  const nextEligibleDate = user?.profile?.last_donation_date 
    ? addDays(new Date(user.profile.last_donation_date), 90)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your donor information and check eligibility status.
          </p>
        </div>

        {/* Eligibility Status */}
        <div className={`mb-8 p-6 rounded-lg border ${
          isEligible 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3">
            {isEligible ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            ) : (
              <ExclamationCircleIcon className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-semibold ${
                isEligible ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {isEligible ? 'Eligible to Donate' : 'Not Currently Eligible'}
              </h3>
              <p className={`text-sm ${
                isEligible ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {isEligible 
                  ? 'You can schedule a donation appointment.'
                  : `Next eligible date: ${nextEligibleDate ? format(nextEligibleDate, 'MMMM dd, yyyy') : 'Update your last donation date'}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                {...register('full_name')}
                error={errors.full_name?.message}
              />
              
              <Input
                label="Phone Number"
                {...register('phone')}
                error={errors.phone?.message}
              />
              
              <Input
                label="City"
                {...register('city')}
                error={errors.city?.message}
              />
              
              <Select
                label="Blood Group"
                options={bloodGroupOptions}
                {...register('blood_group')}
                error={errors.blood_group?.message}
              />
              
              <Input
                label="Last Donation Date"
                type="date"
                {...register('last_donation_date')}
                error={errors.last_donation_date?.message}
                helperText="Used to calculate donation eligibility"
              />
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notify_email"
                  {...register('notify_email')}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="notify_email" className="ml-2 text-sm text-gray-700">
                  Receive email notifications
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" loading={loading}>
                Update Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};