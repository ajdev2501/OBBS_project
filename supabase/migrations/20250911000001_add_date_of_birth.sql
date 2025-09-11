-- Add date_of_birth column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN date_of_birth date;

-- Add a comment for documentation
COMMENT ON COLUMN public.profiles.date_of_birth IS 'Date of birth for age verification and donor eligibility checks';
