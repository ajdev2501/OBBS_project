# 🩸 Blood Bank Management System (OBBS)

A comprehensive, modern web application for managing blood bank operations with real-time inventory tracking, automated allocation, and role-based access control.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-green.svg)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646CFF.svg)](https://vitejs.dev/)

## 🌟 Features

### 👥 Multi-Role System
- **🌐 Public Users**: Search blood availability, submit anonymous requests
- **🩸 Donors**: Profile management, eligibility tracking, donation history
- **⚡ Administrators**: Complete system oversight, inventory management, analytics

### 🏥 Core Functionality
- **📊 Real-time Inventory Management**: FEFO (First-Expire-First-Out) allocation system
- **📋 Blood Request Workflow**: From submission to fulfillment with status tracking
- **⏰ Donor Eligibility System**: Automated 90-day cooldown period enforcement
- **📢 Notice Management**: System-wide announcements and targeted notifications
- **📈 Analytics Dashboard**: Comprehensive reporting and data visualization
- **📱 Mobile Responsive**: Optimized for all device sizes
- **🔄 Real-time Updates**: Live data synchronization across all clients

## 🚀 Tech Stack

### Frontend
- **⚛️ React 18** - Modern UI framework with hooks
- **📘 TypeScript** - Type-safe development
- **🎨 Tailwind CSS** - Utility-first styling
- **🛣️ React Router v6** - Client-side routing with guards
- **📝 React Hook Form** - Form state management
- **✅ Zod** - Schema validation
- **🖼️ Heroicons** - Beautiful SVG icons
- **📊 Recharts** - Data visualization

### Backend & Infrastructure
- **🗄️ Supabase** - PostgreSQL database with real-time capabilities
- **🔐 Supabase Auth** - Authentication and authorization
- **🔒 Row Level Security** - Database-level security policies
- **⚡ Vite** - Fast build tool and development server

## 📥 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 1. Clone Repository
```bash
git clone https://github.com/ajdev2501/OBBS_project.git
cd OBBS_project
npm install
```

### 2. Supabase Configuration
1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to SQL Editor in your Supabase dashboard
3. Run the migration files in order:
   ```sql
   -- Run these files in Supabase SQL Editor:
   supabase/migrations/20250902115438_dawn_snowflake.sql
   supabase/migrations/20250902134532_winter_darkness.sql
   supabase/migrations/20250910000001_profile_creation_function.sql
   supabase/migrations/20250911000001_add_date_of_birth.sql
   supabase/migrations/20250911000002_fix_profile_creation_trigger.sql
   ```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Production Build
```bash
npm run build
npm run preview
```

## 📊 Database Architecture

### Core Tables
| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User management | Role-based access, personal info, blood group |
| `inventory` | Blood units | Expiry tracking, FEFO allocation, storage location |
| `requests` | Blood requests | Status workflow, urgency levels, hospital info |
| `allocations` | Request fulfillment | Links requests to inventory units |
| `notices` | Announcements | Targeted by city/blood group, admin management |
| `appointments` | Donation scheduling | Date/time management, status tracking |
| `donations` | History tracking | Links appointments to inventory creation |

### Security Model
- **🔐 Row Level Security (RLS)** enabled on all tables
- **👤 User-based policies**: Users access only their own data
- **⚡ Admin privileges**: Full system access for administrators
- **🌐 Public access**: Limited read access for anonymous users

## 🔄 FEFO Allocation System

Our intelligent allocation system ensures optimal blood utilization:

1. **📋 Request Submission**: Users submit blood requests with hospital details
2. **✅ Admin Approval**: Administrators review and approve requests
3. **🎯 Smart Allocation**: System finds earliest-expiring compatible units
4. **📦 Automatic Fulfillment**: Units are reserved and marked as allocated
5. **📱 Real-time Updates**: All users receive immediate status updates

## 🛠️ User Workflows

### 🌐 Public Users
```
🔍 Search Blood Availability → 📋 Submit Request → 📧 Receive Updates
```
- Search by blood group and city
- Submit anonymous requests with contact information
- View public notices and system announcements

### 🩸 Donors
```
📝 Register → ✅ Check Eligibility → 📅 Schedule Donation → 📊 View History
```
- Complete profile with blood group and medical information
- Check donation eligibility (enforces 90-day waiting period)
- Schedule appointments at donation centers
- Track donation history and impact

### ⚡ Administrators
```
📊 Monitor Dashboard → 📦 Manage Inventory → ✅ Process Requests → 📈 Generate Reports
```
- Overview dashboard with real-time statistics
- CRUD operations for blood inventory
- Request approval and allocation management
- User management and system notices
- Comprehensive analytics and reporting

## 🔧 API Integration

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/user` - Current user profile

### Core API Routes
- `GET /api/inventory` - Blood inventory listing
- `POST /api/requests` - Submit blood request
- `GET /api/notices` - Public notices
- `PUT /api/profiles/:id` - Update user profile

## 📱 Mobile Responsiveness

The application is fully responsive with:
- **📱 Mobile-first design**: Optimized for smartphones
- **💻 Tablet support**: Enhanced layouts for medium screens
- **🖥️ Desktop optimization**: Full feature set on large screens
- **🎨 Touch-friendly UI**: Proper spacing and interactive elements

## 🚀 Deployment Options

### Frontend Deployment
- **Vercel** (Recommended): Zero-config deployment
- **Netlify**: Simple static hosting
- **GitHub Pages**: Free hosting for public repositories
- **AWS S3 + CloudFront**: Enterprise-grade hosting

### Backend (Supabase)
- Fully managed PostgreSQL database
- Built-in authentication and real-time subscriptions
- Global CDN and edge functions
- Automatic backups and scaling

### Environment Setup for Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## 🧪 Testing

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint checking
npm run type-check   # TypeScript validation
```

### Testing Strategy
- **Component Testing**: React component unit tests
- **Integration Testing**: API endpoint testing
- **E2E Testing**: Full user workflow validation
- **Performance Testing**: Load testing for concurrent users

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/ajdev2501/OBBS_project/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ajdev2501/OBBS_project/discussions)
- **Email**: support@bloodbank.com

## 🙏 Acknowledgments

- Healthcare professionals who inspired this project
- Open source community for amazing tools and libraries
- Blood donation organizations for their valuable feedback

## 📚 Documentation

- [User Manual](docs/USER_MANUAL.md)
- [Admin Guide](docs/ADMIN_GUIDE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

**Built with ❤️ for the healthcare community**

*Making blood donation and management more efficient, one drop at a time.*