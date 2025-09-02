import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema } from '../../lib/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { bloodGroups } from '../../lib/validation';

type RegisterFormData = {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  city?: string;
  blood_group?: string;
};

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
      
      <Select
        label="Blood Group"
        options={bloodGroupOptions}
        {...register('blood_group')}
        error={errors.blood_group?.message}
      />

      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>
    </form>
  );
};