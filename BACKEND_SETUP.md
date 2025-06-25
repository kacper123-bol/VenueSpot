# VenueSpot Backend Setup Guide

This guide will help you set up the new SQLite + Node.js backend for your VenueSpot application, replacing the localStorage-based system with a persistent database.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **Web browser** with developer tools

### Installation Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **Serve your frontend** (in a new terminal):
   ```bash
   # Option 1: Using Python (if installed)
   python -m http.server 3000
   
   # Option 2: Using Node.js http-server (install globally first)
   npm install -g http-server
   http-server -p 3000
   
   # Option 3: Using Live Server extension in VS Code
   # Right-click index.html and select "Open with Live Server"
   ```

6. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

## 📂 Project Structure

```
VenueSpot/
├── backend/                     # New backend system
│   ├── server.js               # Express server
│   ├── database.js             # SQLite connection manager
│   ├── package.json            # Node.js dependencies
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── venues.js           # Venue management endpoints
│   │   └── analytics.js        # Analytics endpoints
│   ├── migrations/
│   │   └── init-database.js    # Database initialization
│   └── scripts/
│       └── migrate-localStorage.js # Migration tool
├── database/
│   └── venuespot.db            # SQLite database file (created automatically)
├── frontend/                   # Your existing frontend
│   ├── index.html
│   ├── assets/
│   └── ...
└── BACKEND_SETUP.md           # This file
```

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
# Backend configuration
PORT=3001
NODE_ENV=development

# Database configuration
DB_PATH=../database/venuespot.db

# Security configuration
SESSION_TIMEOUT=86400000
MAX_LOGIN_ATTEMPTS=5
```

### CORS Configuration

The backend is configured to accept requests from:
- http://localhost:3000
- http://127.0.0.1:3000
- http://localhost:5500

If your frontend runs on a different port, update the CORS settings in `backend/server.js`.

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_type TEXT CHECK(user_type IN ('customer', 'owner', 'admin')) DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT 1
);
```

### Venues Table
```sql
CREATE TABLE venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    price TEXT NOT NULL,
    discount TEXT,
    availability TEXT,
    description TEXT,
    detailed_description TEXT,
    image_url TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    contact_address TEXT,
    owner_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### Analytics Tables
- `venue_analytics` - Track venue performance metrics
- `user_activity` - Log user actions
- `bookings` - Store reservation data
- `sessions` - Manage user sessions
- `settings` - Application configuration

## 🔐 Sample Login Credentials

The system creates sample users for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@venuespot.com | admin123 |
| Customer | john@example.com | password123 |
| Owner | jane@example.com | password123 |
| Customer | mike@example.com | password123 |

## 🔄 Migrating from localStorage

If you have existing data in localStorage, follow these steps:

### Step 1: Export localStorage Data

1. Open your existing VenueSpot site in the browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Generate the export script:
   ```bash
   cd backend/scripts
   node migrate-localStorage.js generate-export-script
   ```
5. Copy the generated script and paste it in the browser console
6. Run the script to download your data as JSON

### Step 2: Import Data to SQLite

```bash
cd backend/scripts
node migrate-localStorage.js /path/to/your/exported-data.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password

### Venues
- `GET /api/venues` - Get all venues (with filtering)
- `GET /api/venues/:id` - Get specific venue
- `POST /api/venues` - Create venue (owner/admin)
- `PUT /api/venues/:id` - Update venue (owner/admin)
- `DELETE /api/venues/:id` - Delete venue (owner/admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics (admin)
- `GET /api/analytics/venues/:id` - Venue analytics
- `POST /api/analytics/venues/:id/rating` - Submit rating

### Health Check
- `GET /api/health` - API health status

## 🛠️ Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Initialize/reset database
npm run init-db

# Generate localStorage export script
node scripts/migrate-localStorage.js generate-export-script

# Run migration
node scripts/migrate-localStorage.js data.json
```

## 🔍 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3001/api/health

# Get venues
curl http://localhost:3001/api/venues

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get user info (requires token)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Browser

Visit these URLs in your browser:
- http://localhost:3001/api - API documentation
- http://localhost:3001/api/health - Health check
- http://localhost:3001/api/venues - Public venues list

## 🔒 Security Features

- **Password hashing** with bcrypt
- **Session management** with secure tokens
- **Rate limiting** to prevent abuse
- **Input validation** on all endpoints
- **CORS protection** for cross-origin requests
- **SQL injection protection** with parameterized queries

## 📊 Analytics Features

- **Venue performance tracking** (views, bookings, revenue)
- **User activity logging** (actions, IP, user agent)
- **Revenue reporting** with time-based grouping
- **Customer ratings and reviews**
- **Popular venue types and locations**

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 3001
   netstat -tulpn | grep 3001
   # Kill the process or change port in server.js
   ```

2. **Database permission errors**
   ```bash
   # Make sure the database directory is writable
   chmod 755 database/
   ```

3. **CORS errors**
   - Check frontend is running on port 3000
   - Update CORS settings in server.js if needed

4. **Module not found**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode

Set environment variable for detailed logging:
```bash
NODE_ENV=development npm run dev
```

## 📈 Performance Monitoring

The database includes built-in analytics:
- Query performance logging
- Session management
- User activity tracking
- Venue engagement metrics

## 🔄 Backup Strategy

### Automatic Backups

The SQLite database file (`database/venuespot.db`) should be backed up regularly:

```bash
# Simple file copy
cp database/venuespot.db database/venuespot-backup-$(date +%Y%m%d).db

# SQL dump for version control
sqlite3 database/venuespot.db .dump > database/venuespot-backup.sql
```

### Export Data

```bash
# Export via API (requires admin access)
curl http://localhost:3001/api/analytics/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN" > backup.json
```

## 🆙 Next Steps

1. **Test the new system** with your existing frontend
2. **Migrate your localStorage data** using the migration tool
3. **Customize the analytics** for your specific needs
4. **Set up automated backups** for the database
5. **Deploy to production** when ready

## 📞 Support

If you encounter any issues:

1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure ports 3000 and 3001 are available
4. Check the database file permissions
5. Review the API documentation at `/api`

## 📖 Reading the Database

### **Option 1: GUI Database Browser (Easiest)**
Download **DB Browser for SQLite** (free): https://sqlitebrowser.org/
1. Install and open DB Browser for SQLite
2. Click "Open Database"
3. Navigate to your `database/venuespot.db` file
4. Browse tables, view data, and run SQL queries

### **Option 2: VS Code Extension**
1. Install "SQLite Viewer" extension in VS Code
2. Right-click on `database/venuespot.db`
3. Select "Open Database"

### **Option 3: Command Line Database Reader**
```bash
cd backend/scripts

# Full database overview
node database-reader.js overview

# View specific data
node database-reader.js users
node database-reader.js venues
node database-reader.js sessions
node database-reader.js analytics

# Database statistics
node database-reader.js stats

# Table structure
node database-reader.js describe users

# Custom SQL queries
node database-reader.js query "SELECT * FROM users WHERE user_type = 'admin'"

# Recent activity
node database-reader.js activity 50
```

### **Option 4: Web API (Admin Required)**
Login as admin and access these endpoints:
- `GET /api/db/tables` - List all tables
- `GET /api/db/table/users` - View users table
- `GET /api/db/export` - Download full database export
- `POST /api/db/query` - Run custom SELECT queries

### **Option 5: Direct SQLite Commands**
If you have SQLite installed:
```bash
# Open database
sqlite3 database/venuespot.db

# List tables
.tables

# View table structure
.schema users

# Query data
SELECT * FROM users;
SELECT * FROM venues;

# Exit
.quit
```

The new backend system provides a robust, scalable foundation for your VenueSpot application with persistent data storage, advanced analytics, comprehensive user management, and multiple ways to view and query your data.