/*
# Initial Blood Bank Management System Schema

1. New Tables
   - `profiles` - User profiles with role-based access (donor, admin)
   - `inventory` - Blood unit inventory with FEFO tracking
   - `requests` - Blood requests from public and authenticated users
   - `allocations` - FEFO allocation tracking between requests and inventory
   - `notices` - Public notices and announcements
   - `appointments` - Donor appointment scheduling
   - `donations` - Donation history tracking

2. Security
   - Enable RLS on all tables
   - Role-based policies for profiles (users see own, admins see all)
   - Inventory policies (public sees availability, admins full access)
   - Request policies (anyone can insert, users see own, admins see all)
   - Similar role-based policies for all other tables

3. Business Logic
   - Blood group constraints (A+, A-, B+, B-, O+, O-, AB+, AB-)
   - Status workflows for inventory and requests
   - Expiry date validation
   - Volume and quantity constraints
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('donor', 'admin')) DEFAULT 'donor',
  full_name text NOT NULL,
  phone text,
  city text,
  blood_group text CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  last_donation_date date,
  notify_email boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_group text NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  bag_id text UNIQUE NOT NULL,
  volume_ml integer NOT NULL CHECK (volume_ml > 0),
  storage_location text NOT NULL,
  collected_on date NOT NULL,
  expires_on date NOT NULL CHECK (expires_on > collected_on),
  status text CHECK (status IN ('available','reserved','fulfilled','discarded')) DEFAULT 'available',
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  blood_group text NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  quantity_units integer NOT NULL CHECK (quantity_units > 0),
  hospital text NOT NULL,
  city text NOT NULL,
  urgency text CHECK (urgency IN ('low','medium','high')) DEFAULT 'medium',
  status text CHECK (status IN ('pending','approved','fulfilled','rejected')) DEFAULT 'pending',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create allocations table
CREATE TABLE IF NOT EXISTS allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  inventory_id uuid NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  allocated_at timestamptz DEFAULT now(),
  UNIQUE(request_id, inventory_id)
);

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  city text,
  blood_group text CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES profiles(id),
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text CHECK (status IN ('scheduled','confirmed','completed','cancelled')) DEFAULT 'scheduled',
  donation_center text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id),
  donor_id uuid NOT NULL REFERENCES profiles(id),
  donation_date date NOT NULL,
  volume_ml integer NOT NULL DEFAULT 450,
  bag_id text REFERENCES inventory(bag_id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inventory policies
CREATE POLICY "Public can view available inventory counts"
  ON inventory FOR SELECT
  TO anon
  USING (status = 'available');

CREATE POLICY "Authenticated users can view available inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (status = 'available');

CREATE POLICY "Admins can manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Requests policies
CREATE POLICY "Anyone can insert requests"
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
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allocations policies
CREATE POLICY "Admins can manage allocations"
  ON allocations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notices policies
CREATE POLICY "Anyone can view active notices"
  ON notices FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins can manage notices"
  ON notices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Appointments policies
CREATE POLICY "Donors can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Donors can insert own appointments"
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
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Donations policies
CREATE POLICY "Donors can view own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Admins can manage all donations"
  ON donations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_blood_group ON inventory(blood_group);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_expires_on ON inventory(expires_on);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_blood_group ON requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON profiles(blood_group);