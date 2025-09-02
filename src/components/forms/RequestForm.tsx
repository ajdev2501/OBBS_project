import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestSchema } from '../../lib/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { bloodGroups } from '../../lib/validation';
import type { BloodRequest } from '../../types/database';

type RequestFormData = Omit<BloodRequest, 'id' | 'status' | 'created_by' | 'created_at'>;

interface RequestFormProps {
  onSubmit: (data: RequestFormData) => void;
  loading?: boolean;
  initialData?: Partial<RequestFormData>;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  onSubmit,
  loading = false,
  initialData
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(RequestSchema),
    defaultValues: initialData,
  });

  const bloodGroupOptions = bloodGroups.map(group => ({ value: group, label: group }));
  const urgencyOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          placeholder="Enter full name"
          {...register('requester_name')}
          error={errors.requester_name?.message}
        />
        
        <Input
          label="Phone Number *"
          placeholder="Enter phone number"
          {...register('phone')}
          error={errors.phone?.message}
        />
        
        <Input
          label="Email Address *"
          type="email"
          placeholder="Enter email address"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Select
          label="Blood Group *"
          options={bloodGroupOptions}
          {...register('blood_group')}
          error={errors.blood_group?.message}
        />
        
        <Input
          label="Quantity (Units) *"
          type="number"
          min="1"
          max="10"
          placeholder="Number of units needed"
          {...register('quantity_units', { valueAsNumber: true })}
          error={errors.quantity_units?.message}
        />
        
        <Select
          label="Urgency Level"
          options={urgencyOptions}
          {...register('urgency')}
          error={errors.urgency?.message}
        />
        
        <Input
          label="Hospital Name *"
          placeholder="Enter hospital name"
          {...register('hospital')}
          error={errors.hospital?.message}
        />
        
        <Input
          label="City *"
          placeholder="Enter city"
          {...register('city')}
          error={errors.city?.message}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Submit Blood Request
      </Button>
    </form>
  );
};