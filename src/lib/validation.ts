import { z } from 'zod';

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
export const urgencyLevels = ['low', 'medium', 'high'] as const;

export const BloodGroupSchema = z.enum(bloodGroups);
export const UrgencySchema = z.enum(urgencyLevels);

export const ProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  city: z.string().min(2, 'City must be at least 2 characters').optional(),
  blood_group: BloodGroupSchema.optional(),
  date_of_birth: z.string().refine((date) => {
    // Allow empty string (optional field)
    if (!date || date.trim() === '') return true;
    
    const birthDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) return false;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18 && age <= 80;
  }, 'You must be between 18 and 80 years old to donate blood').optional(),
  last_donation_date: z.string().optional(),
  notify_email: z.boolean().default(true),
});

export const InventorySchema = z.object({
  blood_group: BloodGroupSchema,
  bag_id: z.string().min(3, 'Bag ID must be at least 3 characters'),
  volume_ml: z.number().min(100, 'Volume must be at least 100ml').max(500, 'Volume cannot exceed 500ml'),
  storage_location: z.string().min(2, 'Storage location is required'),
  collected_on: z.string(),
  expires_on: z.string(),
}).refine((data) => {
  const collected = new Date(data.collected_on);
  const expires = new Date(data.expires_on);
  const diffDays = Math.floor((expires.getTime() - collected.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 1 && diffDays <= 42;
}, {
  message: "Expiry date must be 1-42 days after collection date",
  path: ["expires_on"],
});

export const RequestSchema = z.object({
  requester_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  blood_group: BloodGroupSchema,
  quantity_units: z.number().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 units per request'),
  hospital: z.string().min(2, 'Hospital name is required'),
  city: z.string().min(2, 'City is required'),
  urgency: UrgencySchema.default('medium'),
});

export const NoticeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  city: z.string().optional(),
  blood_group: BloodGroupSchema.optional(),
});

export const AppointmentSchema = z.object({
  appointment_date: z.string(),
  appointment_time: z.string(),
  donation_center: z.string().min(2, 'Donation center is required'),
  notes: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = LoginSchema.extend({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  city: z.string().min(2, 'City must be at least 2 characters').optional(),
  blood_group: BloodGroupSchema.optional(),
  date_of_birth: z.string().refine((date) => {
    // Allow empty string (optional field)
    if (!date || date.trim() === '') return true;
    
    const birthDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) return false;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18 && age <= 80;
  }, 'You must be between 18 and 80 years old to donate blood').optional(),
});