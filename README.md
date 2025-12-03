# ConsignPro - Modern Consignment & Logistics Management System

A full-stack, modern consignment and logistics management platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## 🎯 Features

### Customer Features
- 📦 **Public Package Tracking** - Track shipments with tracking number
- 👤 **Customer Portal** - Register, login, and manage account
- 📝 **Package Registration** - Submit new shipment requests
- 💰 **Pricing Calculator** - Estimate shipping costs instantly
- 📅 **Pickup Scheduling** - Request package pickups
- 📧 **Notifications** - Email/SMS notifications for shipment updates

### Admin & Staff Features
- 🎛️ **Admin Dashboard** - Analytics and overview
- 👥 **Staff Management** - Manage warehouse staff, drivers, and admins
- 🔄 **Status Updates** - Update shipment status and tracking events
- 📊 **Reports Generator** - Export shipment data to CSV
- ⚙️ **Settings Management** - Configure branding, notifications, pricing rules

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **UI Components**: Custom components with Lucide icons
- **Notifications**: Nodemailer (email), Twilio-ready (SMS)
- **PDF/Reports**: jsPDF, CSV export

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/consignment_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this"
EMAIL_SERVER="smtp://username:password@smtp.gmail.com:587"
EMAIL_FROM="noreply@consignpro.com"
```

3. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed
```

4. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 👥 Demo Accounts

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@consignpro.com | password123 |
| Warehouse Staff | warehouse@consignpro.com | password123 |
| Driver | driver@consignpro.com | password123 |
| Customer | john.doe@example.com | password123 |
| Customer | jane.smith@example.com | password123 |

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   ├── admin/                 # Admin pages
│   ├── dashboard/             # Customer dashboard
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── shipments/             # Shipment management
│   ├── track/                 # Public tracking page
│   └── pickup/                # Pickup scheduling
├── components/
│   ├── dashboard/             # Dashboard components
│   ├── tracking/              # Tracking components
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── auth/                  # Authentication utilities
│   ├── db/                    # Database client
│   ├── utils/                 # Utility functions
│   └── validators/            # Zod schemas
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
└── public/                    # Static assets
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tracking
- `GET /api/tracking/[trackingNumber]` - Track shipment (public)

### Shipments
- `GET /api/shipments` - List shipments
- `POST /api/shipments` - Create shipment
- `POST /api/shipments/[id]/status` - Update shipment status

### Admin
- `GET /api/staff` - List staff members
- `GET /api/reports/shipments` - Generate reports
- `GET /api/settings` - Get settings

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full API documentation.

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Vercel deployment
- Docker deployment
- AWS deployment
- Environment configuration
- Database setup

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, open an issue on GitHub.
