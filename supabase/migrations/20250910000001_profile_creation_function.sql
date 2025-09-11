-- Create function to handle profile creation during signup
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_full_name text,
  user_phone text DEFAULT NULL,
  user_city text DEFAULT NULL,
  user_blood_group text DEFAULT NULL,
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
    role,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_full_name,
    user_phone,
    user_city,
    user_blood_group,
    user_role,
    now(),
    now()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;

-- Create trigger function to automatically create profile on user signup
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
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'blood_group',
    'donor',
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;
