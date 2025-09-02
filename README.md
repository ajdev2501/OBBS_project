# Blood Bank Management System

A comprehensive web application for managing blood bank operations with role-based access control and real-time inventory management.

## Features

### User Roles
- **Public**: Search blood availability, submit requests anonymously
- **Donor**: Manage profile, check eligibility, view donation history
- **Admin**: Full system management, inventory CRUD, request processing, analytics

### Core Functionality
- **Real-time Inventory Management**: FEFO (First-Expire-First-Out) allocation
- **Blood Request System**: From submission to fulfillment
- **Donor Eligibility Tracking**: 90-day cooldown period
- **Notice Management**: Public announcements and alerts
- **Analytics Dashboard**: Comprehensive reporting for admins

### Technical Stack
- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Routing**: React Router v6 with role-based guards
- **Forms**: React Hook Form + Zod validation
- **UI**: Headless UI + Heroicons
- **Charts**: Recharts for admin analytics

## Setup Instructions

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   - Create a new Supabase project
   - Run the migration SQL in your Supabase SQL editor
   - Copy your project URL and anon key to `.env.local`

3. **Environment Variables**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### Tables
- `profiles` - User profiles with role management
- `inventory` - Blood unit inventory with expiry tracking
- `requests` - Blood requests with status workflow
- `allocations` - FEFO allocation tracking
- `notices` - Public notices and announcements
- `appointments` - Donor appointment scheduling
- `donations` - Donation history tracking

### Row Level Security
All tables have RLS enabled with role-based policies:
- Users can only access their own data
- Admins have full access to system data
- Public users can view limited information

## FEFO Allocation Logic

The system implements First-Expire-First-Out allocation:
1. Requests are approved by admins
2. System finds earliest expiring units of matching blood group
3. Units are allocated and marked as fulfilled
4. Real-time updates notify all users

## User Workflows

### Public User
1. Search blood availability by group/city
2. Submit blood requests with contact details
3. View public notices and announcements

### Donor
1. Register with blood group and contact info
2. Check donation eligibility (90-day rule)
3. Schedule appointments and track history
4. Receive personalized notices

### Admin
1. Monitor system through analytics dashboard
2. Manage inventory with CRUD operations
3. Process requests and handle allocations
4. Manage donors and system notices
5. Generate reports and analytics

## Security Features

- Supabase Authentication with email/password
- Row Level Security (RLS) on all tables
- Role-based access control
- Input validation and sanitization
- Protected API endpoints

## Deployment

The application is ready for production deployment:
- Frontend: Vercel, Netlify, or any static hosting
- Backend: Supabase (managed PostgreSQL + Auth)
- Environment variables configured for production

Built with ❤️ for the healthcare community.