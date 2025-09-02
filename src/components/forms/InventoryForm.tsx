import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InventorySchema } from '../../lib/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { bloodGroups } from '../../lib/validation';

type InventoryFormData = {
  blood_group: string;
  bag_id: string;
  volume_ml: number;
  storage_location: string;
  collected_on: string;
  expires_on: string;
};

interface InventoryFormProps {
  onSubmit: (data: InventoryFormData) => void;
  loading?: boolean;
  initialData?: Partial<InventoryFormData>;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  onSubmit,
  loading = false,
  initialData
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryFormData>({
    resolver: zodResolver(InventorySchema),
    defaultValues: initialData,
  });

  const bloodGroupOptions = bloodGroups.map(group => ({ value: group, label: group }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Blood Group *"
          options={bloodGroupOptions}
          {...register('blood_group')}
          error={errors.blood_group?.message}
        />
        
        <Input
          label="Bag ID *"
          placeholder="Enter unique bag identifier"
          {...register('bag_id')}
          error={errors.bag_id?.message}
        />
        
        <Input
          label="Volume (ml) *"
          type="number"
          min="100"
          max="500"
          placeholder="Volume in milliliters"
          {...register('volume_ml', { valueAsNumber: true })}
          error={errors.volume_ml?.message}
        />
        
        <Input
          label="Storage Location *"
          placeholder="e.g., Refrigerator A-1"
          {...register('storage_location')}
          error={errors.storage_location?.message}
        />
        
        <Input
          label="Collection Date *"
          type="date"
          {...register('collected_on')}
          error={errors.collected_on?.message}
        />
        
        <Input
          label="Expiry Date *"
          type="date"
          {...register('expires_on')}
          error={errors.expires_on?.message}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" loading={loading}>
          {initialData ? 'Update' : 'Add'} Blood Unit
        </Button>
      </div>
    </form>
  );
};