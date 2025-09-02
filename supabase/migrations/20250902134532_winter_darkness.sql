/*
# Fix RLS Policies for Blood Bank System

1. Changes
   - Drop existing problematic policies that cause infinite recursion
   - Create new simplified policies that avoid circular references
   - Fix profile creation policy to allow initial user registration
   - Ensure proper admin access without recursion

2. Security
   - Maintain role-based access control
   - Allow profile creation during registration
   - Prevent infinite recursion in policy checks
   - Ensure admins can access all data safely
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view available inventory counts" ON inventory;
DROP POLICY IF EXISTS "Authenticated users can view available inventory" ON inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;
DROP POLICY IF EXISTS "Anyone can insert requests" ON requests;
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON requests;
DROP POLICY IF EXISTS "Admins can update requests" ON requests;
DROP POLICY IF EXISTS "Admins can manage allocations" ON allocations;
DROP POLICY IF EXISTS "Anyone can view active notices" ON notices;
DROP POLICY IF EXISTS "Admins can manage notices" ON notices;
DROP POLICY IF EXISTS "Donors can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Donors can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Donors can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;
DROP POLICY IF EXISTS "Donors can view own donations" ON donations;
DROP POLICY IF EXISTS "Admins can manage all donations" ON donations;

-- Create new simplified policies for profiles
CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users on own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users on own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create admin policies using a function to avoid recursion
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

CREATE POLICY "Enable all for admins on profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Inventory policies
CREATE POLICY "Public can view available inventory"
  ON inventory FOR SELECT
  TO anon, authenticated
  USING (status = 'available');

CREATE POLICY "Admins can manage all inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Requests policies
CREATE POLICY "Anyone can create requests"
  ON requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own requests"
  ON requests FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Admins can view all requests"
  ON requests FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Allocations policies
CREATE POLICY "Admins can manage all allocations"
  ON allocations FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Notices policies
CREATE POLICY "Anyone can view active notices"
  ON notices FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins can manage all notices"
  ON notices FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Appointments policies
CREATE POLICY "Donors can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Donors can create own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Donors can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Admins can manage all appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Donations policies
CREATE POLICY "Donors can view own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Admins can manage all donations"
  ON donations FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Insert a default admin user (you'll need to update this with your actual admin user ID after registration)
-- This is commented out - you should run this manually in Supabase SQL editor after creating your admin account
-- INSERT INTO profiles (id, role, full_name, phone, city, blood_group, notify_email)
-- VALUES ('your-admin-user-id-here', 'admin', 'System Administrator', '+1234567890', 'Admin City', 'O+', true)
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';