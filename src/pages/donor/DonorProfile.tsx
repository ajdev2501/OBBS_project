import React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useDonorProfile } from '../../hooks/useDonorProfile';
import {
  ProfileSkeleton,
  EligibilityStatus,
  ProfileStats,
  ProfileTips,
  ErrorState
} from '../../components/profile/ProfileComponents';

export const DonorProfile: React.FC = () => {
  const {
    form,
    handleUpdateProfile,
    loading,
    error,
    eligibilityInfo,
    bloodGroupOptions,
    profileCompleteness,
    missingFields,
    refetch,
  } = useDonorProfile();

  const { register, handleSubmit, formState: { errors } } = form;

  if (loading && !form.formState.isDirty) {
    return <ProfileSkeleton />;
  }

  if (error && !form.getValues('full_name')) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

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
        <EligibilityStatus eligibilityInfo={eligibilityInfo} />

        {/* Profile Stats */}
        <ProfileStats 
          profileCompleteness={profileCompleteness}
          missingFields={missingFields}
          eligibilityInfo={eligibilityInfo}
        />

        {/* Profile Tips */}
        <ProfileTips />

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
              
              <Input
                label="Date of Birth"
                type="date"
                {...register('date_of_birth')}
                error={errors.date_of_birth?.message}
                max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                helperText="Used for age verification and donor eligibility"
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
              
              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="notify_email"
                  {...register('notify_email')}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="notify_email" className="text-sm text-gray-700">
                  Receive email notifications for donation opportunities and updates
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                loading={loading}
                className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};