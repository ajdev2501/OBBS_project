import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema } from '../../lib/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { bloodGroups } from '../../lib/validation';
import { z } from 'zod';

type RegisterFormData = z.infer<typeof RegisterSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  loading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, loading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const bloodGroupOptions = [
    { value: '', label: 'Select Blood Group' },
    ...bloodGroups.map(group => ({ value: group, label: group })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name *"
        placeholder="Enter your full name"
        {...register('full_name')}
        error={errors.full_name?.message}
      />
      
      <Input
        label="Email Address *"
        type="email"
        placeholder="Enter your email"
        {...register('email')}
        error={errors.email?.message}
      />
      
      <Input
        label="Password *"
        type="password"
        placeholder="Choose a strong password"
        {...register('password')}
        error={errors.password?.message}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          placeholder="Enter phone number"
          {...register('phone')}
          error={errors.phone?.message}
        />
        
        <Input
          label="City"
          placeholder="Enter your city"
          {...register('city')}
          error={errors.city?.message}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          {...register('date_of_birth')}
          error={errors.date_of_birth?.message}
          max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        />
        
        <Select
          label="Blood Group"
          options={bloodGroupOptions}
          {...register('blood_group')}
          error={errors.blood_group?.message}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>
    </form>
  );
};