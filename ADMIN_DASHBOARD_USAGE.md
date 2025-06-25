# VenueSpot Admin Dashboard Usage Guide

## Overview

The VenueSpot Admin Dashboard is a comprehensive administrative interface that provides real-time analytics, user management, and database oversight capabilities for administrators.

## Accessing the Admin Dashboard

### Prerequisites
1. Admin user account with `user_type = 'admin'`
2. Backend server running on port 3001
3. Valid admin session

### Login Process
1. Navigate to `admin-dashboard.html`
2. The system will automatically check your authentication status
3. If not logged in as admin, you'll be redirected to the main login page
4. Admin users will see the full dashboard interface

## Dashboard Features

### 🏠 Overview Tab

**Real-time Statistics Cards:**
- Total Users
- Total Venues  
- Total Revenue
- Confirmed Bookings

**Interactive Charts:**
- User Registration Trends (line chart)
- Venue Performance (bar chart showing top venues by views)

**Recent Activity Feed:**
- Latest user actions and system events
- Admin operations logging
- Real-time updates

**Time Period Selection:**
- 7 days, 30 days, or 90 days
- Affects all overview metrics and charts

### 👥 Users Tab

**Advanced Search & Filtering:**
- **Search by:** User ID, Name (first/last), or Email
- **Filter by:** User Type (Customer/Owner/Admin)
- **Filter by:** Status (Active/Inactive)
- **Sort by:** Any column (ID, Name, Email, Type, Created Date, Status)

**User Management Features:**
- **View Details:** Comprehensive user information including:
  - Basic information (ID, name, email, type, status)
  - Statistics (venues owned, total bookings)
  - Venue list (for owners)
  - Recent booking history (for customers)
  - Recent activity log
- **Toggle Status:** Activate/Deactivate users
- **Export:** Download filtered user data as JSON

**Pagination:**
- 20 users per page (configurable)
- Navigation controls with page info
- Real-time count updates

### 📈 Analytics Tab

**Revenue Analysis:**
- Revenue timeline chart
- Revenue breakdown by venue type
- Top performing venues

**User Activity Analysis:**
- User registration trends
- Activity patterns over time

**Venue Analytics:**
- Venue types distribution (doughnut chart)
- Popular locations (horizontal bar chart)

**Time Period Controls:**
- 7, 30, or 90-day analysis periods
- All charts update dynamically

### 🗄️ Database Tab

**Database Tables Browser:**
- View all database tables with record counts
- Click any table to view its data (first 50 records)
- Table structure information

**Custom Query Interface:**
- Execute custom SELECT queries
- Safety restrictions (SELECT-only)
- Results displayed in formatted tables
- Query history and error handling

**Export Capabilities:**
- Full database export as JSON
- Individual table exports
- Filtered data exports

## Keyboard Shortcuts

- `Ctrl/Cmd + 1` - Switch to Overview tab
- `Ctrl/Cmd + 2` - Switch to Users tab  
- `Ctrl/Cmd + 3` - Switch to Analytics tab
- `Ctrl/Cmd + 4` - Switch to Database tab

## Quick Stats Sidebar

The left sidebar displays real-time quick statistics:
- Total Users
- Active Sessions
- Total Venues
- Total Revenue

These update automatically as you navigate between tabs.

## User Search Examples

### Search by ID
```
123
```

### Search by Name
```
John Smith
john
smith
```

### Search by Email
```
admin@venuespot.com
admin
@venuespot.com
```

### Combined Filters
- Search: "john" + Filter: "customer" + Status: "active"
- This will show all active customers with "john" in their name or email

## Database Query Examples

### Basic User Query
```sql
SELECT id, first_name, last_name, email, user_type 
FROM users 
WHERE is_active = 1 
ORDER BY created_at DESC
```

### Venue Performance Query
```sql
SELECT v.name, v.type, v.location, COUNT(b.id) as booking_count
FROM venues v
LEFT JOIN bookings b ON v.id = b.venue_id
GROUP BY v.id
ORDER BY booking_count DESC
```

### Revenue Analysis Query
```sql
SELECT DATE(created_at) as date, 
       SUM(total_price) as daily_revenue,
       COUNT(*) as booking_count
FROM bookings 
WHERE status = 'completed'
  AND created_at >= DATE('now', '-30 days')
GROUP BY DATE(created_at)
ORDER BY date
```

## Security Features

### Authentication & Authorization
- Admin-only access with role verification
- Session-based authentication
- Automatic redirect for unauthorized users

### Query Safety
- SELECT-only queries in database interface
- SQL injection prevention with parameterized queries
- Input validation and sanitization

### Activity Logging
- All admin actions are logged with timestamps
- User interactions tracked for audit purposes
- IP address logging for security monitoring

## API Integration

The dashboard integrates with these backend endpoints:

### Analytics APIs
- `GET /api/analytics/dashboard` - Dashboard overview data
- `GET /api/analytics/reports/revenue` - Revenue reports
- `GET /api/analytics/activity` - User activity logs

### User Management APIs
- `GET /api/admin/users/search` - Enhanced user search
- `GET /api/admin/users/:id` - Detailed user information
- `PUT /api/admin/users/:id/status` - Update user status
- `POST /api/admin/users/bulk-action` - Bulk operations

### Database APIs
- `GET /api/db/tables` - List database tables
- `GET /api/db/table/:name` - Table data with pagination
- `POST /api/db/query` - Execute custom queries
- `GET /api/db/export` - Full database export

## Troubleshooting

### Common Issues

**Dashboard won't load:**
- Check if backend server is running on port 3001
- Verify admin user has correct permissions
- Check browser console for authentication errors

**Charts not displaying:**
- Ensure Chart.js library is loaded
- Check for JavaScript errors in console
- Verify API endpoints are responding

**Search not working:**
- Check search query format
- Verify backend admin-users routes are properly configured
- Test API endpoints directly

**Export functionality issues:**
- Check browser download permissions
- Verify JSON data is properly formatted
- Test with smaller data sets first

### Performance Optimization

**Large Datasets:**
- Use pagination for user lists (20 items per page)
- Implement search filters to reduce result sets
- Consider database indexing for frequently searched columns

**Chart Performance:**
- Limit chart data points for better rendering
- Use appropriate chart types for data size
- Implement loading states for better UX

## Browser Support

**Recommended Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- ES6 JavaScript support
- CSS Grid and Flexbox
- Fetch API
- Local Storage

## Updates and Maintenance

### Adding New Features
1. Update backend APIs as needed
2. Modify frontend JavaScript functions
3. Add corresponding UI elements
4. Update CSS styles for consistency
5. Test with sample data

### Database Schema Changes
1. Update query interfaces
2. Modify table viewers
3. Update export functionality
4. Test all affected features

## Support

For technical support or feature requests, refer to the main project documentation or contact the development team.