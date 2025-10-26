# 👨‍🍳 Staff Management Dashboard

A comprehensive restaurant management system built with React, TypeScript, and Ant Design. This staff-facing application allows restaurant personnel to manage orders, tables, menu items, and monitor real-time restaurant operations.

## ✨ Features

### 📋 **Order Management**
- **Real-time order queue** with live updates via Socket.io
- **Order status tracking** (PENDING → IN_PROGRESS → DONE → CANCELLED)
- **Order details view** with customer notes and special requests
- **Kitchen workflow** optimization with visual order cards
- **Time tracking** for order completion monitoring

### 🍽️ **Menu Management**
- **CRUD operations** for menu items with image upload
- **Category management** (Main Course, Noodle, Beverage, Dessert)
- **Availability toggle** for out-of-stock items
- **Pricing management** with real-time updates
- **Image upload** via Cloudinary integration
- **Soft delete** functionality for menu history

### 🏪 **Table Management**
- **Table status monitoring** (AVAILABLE, OCCUPIED, RESERVED)
- **QR code generation** for each table
- **Session management** with table assignments
- **Capacity management** for different table sizes
- **Table turnover tracking**

### 🔐 **Staff Authentication**
- **Secure login** with JWT tokens and HTTP-only cookies
- **Google OAuth** integration for streamlined access
- **Role-based access** control for different staff levels
- **Session management** with automatic logout

### 📊 **Dashboard & Analytics**
- **Real-time statistics** dashboard
- **Order volume tracking**
- **Revenue monitoring**
- **Popular menu item insights**
- **Performance metrics**

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Framework**: Ant Design (antd) v5 with custom theming
- **Build Tool**: Vite with HMR
- **State Management**: React Context API + useState/useEffect
- **Routing**: React Router DOM v7
- **Real-time**: Socket.io Client for live updates
- **Date/Time**: Day.js for date manipulation
- **Icons**: Ant Design Icons
- **HTTP Client**: Fetch API with custom hooks

## 📱 Pages & Components

### **Core Pages**
- **Dashboard** - Main overview with key metrics
- **Orders** - Order queue management and processing
- **Menu** - Menu item CRUD operations
- **Tables** - Table management and QR generation
- **Settings** - Restaurant configuration and staff management

### **Key Components**
- **OrderCard** - Individual order display with actions
- **MenuForm** - Add/edit menu items with image upload
- **TableGrid** - Visual table layout management
- **StatusBadge** - Order and table status indicators
- **ImageUpload** - Cloudinary-integrated image uploader

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Backend API running on localhost:3000

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd admin-ordering-frontend/staff-fullstack-website
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**
Create a `.env` file:
```bash
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open browser**
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── OrderCard.tsx   # Order display component
│   ├── MenuForm.tsx    # Menu item form
│   ├── TableGrid.tsx   # Table management grid
│   └── ...             # Other shared components
├── contexts/
│   ├── AuthContext.tsx # Authentication state
│   └── SocketContext.tsx # Socket.io connection
├── pages/
│   ├── Dashboard.tsx   # Main overview page
│   ├── Orders.tsx      # Order management
│   ├── Menu.tsx        # Menu CRUD operations
│   ├── Tables.tsx      # Table management
│   ├── Settings.tsx    # Configuration page
│   └── Login.tsx       # Staff authentication
├── hooks/
│   ├── useAuth.ts      # Authentication logic
│   ├── useSocket.ts    # Socket.io hooks
│   └── useApi.ts       # API request helpers
├── utils/
│   └── api.ts          # API configuration
├── main.tsx            # App entry point with routing
└── index.css           # Global styles + Ant Design
```

## 🎨 Design System

### **Ant Design Theme**
- **Primary Color**: Blue (`#1890ff`)
- **Success Color**: Green (`#52c41a`)
- **Warning Color**: Orange (`#faad14`)
- **Error Color**: Red (`#f5222d`)

### **Status Colors**
- **PENDING**: Orange (รอดำเนินการ)
- **IN_PROGRESS**: Blue (กำลังทำ)
- **DONE**: Green (เสร็จแล้ว)
- **CANCELLED**: Red (ยกเลิก)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Integration

### **Authentication**
- **Login**: `POST /auth/login`
- **Google OAuth**: `GET /auth/google`
- **Logout**: Clears HTTP-only cookies

### **Order Management**
- **Get Orders**: `GET /orders/queue`
- **Update Status**: `PATCH /orders/:id/status`
- **Order Details**: `GET /orders/:id`

### **Menu Management**
- **List Items**: `GET /menu`
- **Create Item**: `POST /menu`
- **Update Item**: `PATCH /menu/:id`
- **Delete Item**: `DELETE /menu/:id`
- **Upload Image**: `POST /upload/image`

### **Table Management**
- **List Tables**: `GET /tables`
- **Create Table**: `POST /tables`
- **Update Status**: `PATCH /tables/:id/status`
- **Generate QR**: `GET /tables/:id/qr`

## 📊 Real-time Features

### **Socket.io Events**
- **join_staff** - Join staff room for notifications
- **order_created** - New order notifications
- **order_updated** - Order status changes
- **table_updated** - Table status changes

## 🔐 Authentication Flow

1. **Staff Login** with email/password or Google OAuth
2. **JWT Token** stored in HTTP-only cookie
3. **Role-based access** to different dashboard sections
4. **Automatic logout** on token expiration
5. **Session persistence** across browser refreshes

## 🏪 Default Admin Account

After running database seed:
- **Email**: admin@restaurant.com
- **Password**: admin123

## 📄 License

This project is part of a university full-stack development course (Group 12).

---