import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { bloodGroups } from '../../lib/validation';

const SearchSchema = z.object({
  blood_group: z.string().optional(),
  city: z.string().optional(),
});

type SearchFormData = z.infer<typeof SearchSchema>;

interface SearchFormProps {
  onSearch: (filters: SearchFormData) => void;
  loading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SearchFormData>({
    resolver: zodResolver(SearchSchema),
  });

  const bloodGroupOptions = [
    { value: '', label: 'All Blood Groups' },
    ...bloodGroups.map(group => ({ value: group, label: group })),
  ];

  return (
    <form onSubmit={handleSubmit(onSearch)} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Blood Availability</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Blood Group"
          options={bloodGroupOptions}
          {...register('blood_group')}
          error={errors.blood_group?.message}
        />
        
        <Input
          label="City"
          placeholder="Enter city name"
          {...register('city')}
          error={errors.city?.message}
        />
        
        <div className="flex items-end">
          <Button
            type="submit"
            icon={MagnifyingGlassIcon}
            loading={loading}
            className="w-full"
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};