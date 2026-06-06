# Dineway Global Admin — MERN Stack

Super Admin Dashboard for managing restaurants, hotels, users, orders, bookings, reviews, finance, reports, support & settings.

## Stack
- **Frontend**: React + Vite + Recharts + Lucide + React Router
- **Backend**: Express + MongoDB (Mongoose) + JWT Auth
- **Database**: MongoDB

## Quick Start

### 1. Start MongoDB
Make sure MongoDB is running on `localhost:27017`.

### 2. Install & seed backend
```bash
cd server
npm install
npm run seed        # Seeds database with demo data
npm run dev         # Starts on http://localhost:5000
```

### 3. Install & start frontend
```bash
cd client
npm install
npm run dev         # Starts on http://localhost:3000
```

### 4. Login
- URL: http://localhost:3000
- Email: `admin@dineway.com`
- Password: `admin123`

## Features
| Page | Description |
|------|-------------|
| Dashboard | Stats, revenue charts, top venues, recent activity |
| Restaurants | CRUD, filter by status/country, search |
| Hotels | CRUD, filter, star ratings |
| Users | CRUD, role/status management |
| Orders | View, filter, update order status |
| Bookings | Hotel bookings with check-in/out |
| Reviews | Moderate, flag, remove reviews |
| Finance | Transactions, revenue/refund summaries |
| Reports | Charts — revenue, orders by category |
| Support | Ticket management with priority/status |
| Settings | Site config, timezone, currency, toggles |
