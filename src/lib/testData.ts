import { supabase } from './supabase';
import type { BloodRequest, InventoryItem, Notice } from '../types/database';

export const createTestBloodRequests = async () => {
  const testRequests = [
    {
      requester_name: 'John Smith',
      phone: '+1-555-0101',
      email: 'john.smith@email.com',
      blood_group: 'A+',
      quantity_units: 2,
      hospital: 'City General Hospital',
      city: 'New York',
      urgency: 'high',
      status: 'pending',
      created_by: null,
    },
    {
      requester_name: 'Maria Garcia',
      phone: '+1-555-0102',
      email: 'maria.garcia@email.com',
      blood_group: 'O-',
      quantity_units: 1,
      hospital: 'St. Mary Medical Center',
      city: 'Los Angeles',
      urgency: 'high',
      status: 'pending',
      created_by: null,
    },
    {
      requester_name: 'David Johnson',
      phone: '+1-555-0103',
      email: 'david.johnson@email.com',
      blood_group: 'B+',
      quantity_units: 3,
      hospital: 'Memorial Hospital',
      city: 'Chicago',
      urgency: 'medium',
      status: 'pending',
      created_by: null,
    },
    {
      requester_name: 'Sarah Wilson',
      phone: '+1-555-0104',
      email: 'sarah.wilson@email.com',
      blood_group: 'AB+',
      quantity_units: 1,
      hospital: 'Regional Medical Center',
      city: 'Houston',
      urgency: 'low',
      status: 'approved',
      created_by: null,
    },
    {
      requester_name: 'Michael Brown',
      phone: '+1-555-0105',
      email: 'michael.brown@email.com',
      blood_group: 'O+',
      quantity_units: 2,
      hospital: 'University Hospital',
      city: 'Boston',
      urgency: 'high',
      status: 'pending',
      created_by: null,
    },
    {
      requester_name: 'Emily Davis',
      phone: '+1-555-0106',
      email: 'emily.davis@email.com',
      blood_group: 'A-',
      quantity_units: 1,
      hospital: 'Children\'s Hospital',
      city: 'Seattle',
      urgency: 'medium',
      status: 'pending',
      created_by: null,
    },
    {
      requester_name: 'Robert Miller',
      phone: '+1-555-0107',
      email: 'robert.miller@email.com',
      blood_group: 'B-',
      quantity_units: 2,
      hospital: 'Emergency Medical Center',
      city: 'Miami',
      urgency: 'high',
      status: 'pending',
      created_by: null,
    },
    {
      requester_name: 'Jennifer Taylor',
      phone: '+1-555-0108',
      email: 'jennifer.taylor@email.com',
      blood_group: 'AB-',
      quantity_units: 1,
      hospital: 'Trauma Center',
      city: 'Denver',
      urgency: 'medium',
      status: 'fulfilled',
      created_by: null,
    },
  ];

  try {
    const { data, error } = await supabase
      .from('requests')
      .insert(testRequests)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test requests:', error);
    throw error;
  }
};

export const createTestInventoryItems = async () => {
  const testInventory: Omit<InventoryItem, 'id' | 'created_at'>[] = [
    {
      blood_group: 'A+',
      bag_id: 'BAG-A+001',
      volume_ml: 450,
      storage_location: 'Refrigerator A-1',
      collected_on: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      expires_on: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'available',
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      blood_group: 'A+',
      bag_id: 'BAG-A+002',
      volume_ml: 450,
      storage_location: 'Refrigerator A-2',
      collected_on: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expires_on: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'available',
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      blood_group: 'O-',
      bag_id: 'BAG-O-001',
      volume_ml: 450,
      storage_location: 'Refrigerator B-1',
      collected_on: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expires_on: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'available',
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      blood_group: 'O+',
      bag_id: 'BAG-O+001',
      volume_ml: 450,
      storage_location: 'Refrigerator B-2',
      collected_on: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expires_on: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'available',
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      blood_group: 'B+',
      bag_id: 'BAG-B+001',
      volume_ml: 450,
      storage_location: 'Refrigerator C-1',
      collected_on: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      expires_on: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'available',
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      blood_group: 'AB+',
      bag_id: 'BAG-AB+001',
      volume_ml: 450,
      storage_location: 'Refrigerator D-1',
      collected_on: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expires_on: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'available',
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      blood_group: 'A-',
      bag_id: 'BAG-A-001',
      volume_ml: 450,
      storage_location: 'Refrigerator A-3',
      collected_on: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      expires_on: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Expiring soon
      status: 'available',
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      blood_group: 'B-',
      bag_id: 'BAG-B-001',
      volume_ml: 450,
      storage_location: 'Refrigerator C-2',
      collected_on: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      expires_on: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Expiring soon
      status: 'available',
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
  ];

  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert(testInventory)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test inventory:', error);
    throw error;
  }
};

export const createTestNotices = async () => {
  const testNotices: Omit<Notice, 'id' | 'created_at'>[] = [
    {
      title: 'Urgent: O- Blood Needed',
      message: 'We are experiencing a critical shortage of O- blood. Please donate if you are able.',
      city: 'New York',
      blood_group: 'O-',
      active: true,
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      title: 'Blood Drive Event This Weekend',
      message: 'Join us for our monthly blood drive at the Community Center. Free health checkups included!',
      city: null,
      blood_group: null,
      active: true,
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
    {
      title: 'A+ Blood Shortage Alert',
      message: 'Current inventory levels for A+ blood are below recommended levels. Donations urgently needed.',
      city: 'Los Angeles',
      blood_group: 'A+',
      active: true,
      created_by: (await supabase.auth.getUser()).data.user?.id || '',
    },
  ];

  try {
    const { data, error } = await supabase
      .from('notices')
      .insert(testNotices)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test notices:', error);
    throw error;
  }
};

export const createAllTestData = async () => {
  try {
    console.log('Creating test data...');
    
    const [requests, inventory, notices] = await Promise.all([
      createTestBloodRequests(),
      createTestInventoryItems(),
      createTestNotices(),
    ]);

    console.log('Test data created successfully:', {
      requests: requests?.length || 0,
      inventory: inventory?.length || 0,
      notices: notices?.length || 0,
    });

    return { requests, inventory, notices };
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
};

export const clearTestData = async () => {
  try {
    console.log('Clearing test data...');
    
    // Clear in reverse order to avoid foreign key constraints
    await Promise.all([
      supabase.from('requests').delete().neq('id', ''),
      supabase.from('inventory').delete().neq('id', ''),
      supabase.from('notices').delete().neq('id', ''),
    ]);

    console.log('Test data cleared successfully');
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw error;
  }
};
