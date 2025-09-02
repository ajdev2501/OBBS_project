import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '../../lib/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

type LoginFormData = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        {...register('email')}
        error={errors.email?.message}
      />
      
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        {...register('password')}
        error={errors.password?.message}
      />

      <Button type="submit" loading={loading} className="w-full">
        Sign In
      </Button>
    </form>
  );
};