export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'donor' | 'admin';
          full_name: string;
          phone: string | null;
          city: string | null;
          blood_group: BloodGroup | null;
          date_of_birth: string | null;
          last_donation_date: string | null;
          notify_email: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'donor' | 'admin';
          full_name: string;
          phone?: string | null;
          city?: string | null;
          blood_group?: BloodGroup | null;
          date_of_birth?: string | null;
          last_donation_date?: string | null;
          notify_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'donor' | 'admin';
          full_name?: string;
          phone?: string | null;
          city?: string | null;
          blood_group?: BloodGroup | null;
          date_of_birth?: string | null;
          last_donation_date?: string | null;
          notify_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at'>>;
      };
      requests: {
        Row: BloodRequest;
        Insert: Omit<BloodRequest, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BloodRequest, 'id' | 'created_at'>>;
      };
      allocations: {
        Row: Allocation;
        Insert: Omit<Allocation, 'id' | 'allocated_at'> & {
          id?: string;
          allocated_at?: string;
        };
        Update: Partial<Omit<Allocation, 'id' | 'allocated_at'>>;
      };
      notices: {
        Row: Notice;
        Insert: Omit<Notice, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Notice, 'id' | 'created_at'>>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Appointment, 'id' | 'created_at'>>;
      };
      donations: {
        Row: Donation;
        Insert: Omit<Donation, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Donation, 'id' | 'created_at'>>;
      };
    };
  };
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export type InventoryStatus = 'available' | 'reserved' | 'fulfilled' | 'discarded';
export type RequestStatus = 'pending' | 'approved' | 'fulfilled' | 'rejected';
export type Urgency = 'low' | 'medium' | 'high';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  role: 'donor' | 'admin';
  full_name: string;
  phone: string | null;
  city: string | null;
  blood_group: BloodGroup | null;
  date_of_birth: string | null;
  last_donation_date: string | null;
  notify_email: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  blood_group: BloodGroup;
  bag_id: string;
  volume_ml: number;
  storage_location: string;
  collected_on: string;
  expires_on: string;
  status: InventoryStatus;
  created_by: string;
  created_at: string;
}

export interface BloodRequest {
  id: string;
  requester_name: string;
  phone: string;
  email: string;
  blood_group: BloodGroup;
  quantity_units: number;
  hospital: string;
  city: string;
  urgency: Urgency;
  status: RequestStatus;
  created_by: string | null;
  created_at: string;
}

export interface Allocation {
  id: string;
  request_id: string;
  inventory_id: string;
  allocated_at: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  city: string | null;
  blood_group: BloodGroup | null;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  donor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  donation_center: string;
  notes: string | null;
  created_at: string;
}

export interface Donation {
  id: string;
  appointment_id: string | null;
  donor_id: string;
  donation_date: string;
  volume_ml: number;
  bag_id: string | null;
  created_at: string;
}