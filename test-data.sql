-- Test data for Blood Bank Management System

-- First, check if we have any profiles (required for foreign key references)
-- Note: These will need to be inserted via your app since they need to reference auth.users

-- Add some inventory items (you'll need to replace the created_by UUIDs with actual user IDs from your auth.users table)
-- For now, let's add some requests that don't require created_by

-- Sample blood requests (public requests don't need created_by)
INSERT INTO requests (requester_name, phone, email, blood_group, quantity_units, hospital, city, urgency, status) VALUES
('John Smith', '+1-555-0101', 'john.smith@email.com', 'A+', 2, 'City General Hospital', 'New York', 'high', 'pending'),
('Maria Garcia', '+1-555-0102', 'maria.garcia@email.com', 'O-', 1, 'St. Mary Medical Center', 'Los Angeles', 'high', 'pending'),
('David Johnson', '+1-555-0103', 'david.johnson@email.com', 'B+', 3, 'Memorial Hospital', 'Chicago', 'medium', 'pending'),
('Sarah Wilson', '+1-555-0104', 'sarah.wilson@email.com', 'AB+', 1, 'Regional Medical Center', 'Houston', 'low', 'approved'),
('Mike Brown', '+1-555-0105', 'mike.brown@email.com', 'O+', 2, 'University Hospital', 'Phoenix', 'medium', 'pending'),
('Lisa Davis', '+1-555-0106', 'lisa.davis@email.com', 'A-', 1, 'Children''s Hospital', 'Philadelphia', 'high', 'pending'),
('Robert Taylor', '+1-555-0107', 'robert.taylor@email.com', 'B-', 2, 'Veterans Hospital', 'San Antonio', 'medium', 'pending'),
('Jennifer Martinez', '+1-555-0108', 'jennifer.martinez@email.com', 'AB-', 1, 'County Hospital', 'San Diego', 'low', 'pending');

-- These would need actual user UUIDs from your auth.users table:
-- Sample inventory items (commented out until we have user IDs)
/*
INSERT INTO inventory (blood_group, bag_id, volume_ml, storage_location, collected_on, expires_on, status, created_by) VALUES
('A+', 'BAG001', 450, 'Section-A-1', '2024-09-01', '2024-10-01', 'available', 'USER_UUID_HERE'),
('O-', 'BAG002', 450, 'Section-O-1', '2024-09-02', '2024-10-02', 'available', 'USER_UUID_HERE'),
('B+', 'BAG003', 450, 'Section-B-1', '2024-09-03', '2024-10-03', 'available', 'USER_UUID_HERE'),
('AB+', 'BAG004', 450, 'Section-AB-1', '2024-09-04', '2024-10-04', 'available', 'USER_UUID_HERE'),
('O+', 'BAG005', 450, 'Section-O-2', '2024-09-05', '2024-10-05', 'available', 'USER_UUID_HERE'),
('A-', 'BAG006', 450, 'Section-A-2', '2024-09-06', '2024-10-06', 'available', 'USER_UUID_HERE'),
('B-', 'BAG007', 450, 'Section-B-2', '2024-09-07', '2024-10-07', 'available', 'USER_UUID_HERE'),
('AB-', 'BAG008', 450, 'Section-AB-2', '2024-09-08', '2024-10-08', 'available', 'USER_UUID_HERE');
*/
