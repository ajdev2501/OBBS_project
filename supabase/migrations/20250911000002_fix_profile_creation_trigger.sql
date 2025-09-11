-- Fix profile creation trigger to include date_of_birth field
-- This updates the existing trigger function to properly extract and save
-- the date_of_birth from user metadata during registration

-- First, drop the existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS create_user_profile(uuid, text, text, text, text, text);

-- Create the updated function with date_of_birth parameter
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_full_name text,
  user_phone text DEFAULT NULL,
  user_city text DEFAULT NULL,
  user_blood_group text DEFAULT NULL,
  user_date_of_birth date DEFAULT NULL,
  user_role text DEFAULT 'donor'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (
    id,
    full_name,
    phone,
    city,
    blood_group,
    date_of_birth,
    role,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_full_name,
    user_phone,
    user_city,
    user_blood_group,
    user_date_of_birth,
    user_role,
    now(),
    now()
  );
END;
$$;

-- Update the trigger function to include date_of_birth extraction
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert new profile with data from auth.users metadata
  INSERT INTO profiles (
    id,
    full_name,
    phone,
    city,
    blood_group,
    date_of_birth,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'blood_group',
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
           AND NEW.raw_user_meta_data->>'date_of_birth' != '' 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
      ELSE NULL 
    END,
    'donor',
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user TO authenticated;
