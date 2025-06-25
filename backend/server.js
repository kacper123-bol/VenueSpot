const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import database and routes
const database = require('./database');
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const analyticsRoutes = require('./routes/analytics');
const databaseViewerRoutes = require('./routes/database-viewer');
const adminUsersRoutes = require('./routes/admin-users');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration - allow requests from frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 auth requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.'
    }
});
app.use('/api/auth', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/db', databaseViewerRoutes);
app.use('/api/admin/users', adminUsersRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        const stats = await database.getStats();
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: {
                connected: true,
                stats: stats
            },
            uptime: process.uptime()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed'
        });
    }
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'VenueSpot API',
        version: '1.0.0',
        description: 'Backend API for VenueSpot venue marketplace',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'User login',
                'POST /api/auth/logout': 'User logout',
                'GET /api/auth/me': 'Get current user info',
                'POST /api/auth/refresh': 'Refresh session token',
                'POST /api/auth/change-password': 'Change user password',
                'GET /api/auth/sessions': 'Get user sessions',
                'DELETE /api/auth/sessions/:token': 'Revoke session'
            },
            venues: {
                'GET /api/venues': 'Get all venues (with filters)',
                'GET /api/venues/:id': 'Get specific venue',
                'POST /api/venues': 'Create new venue (owner/admin)',
                'PUT /api/venues/:id': 'Update venue (owner/admin)',
                'DELETE /api/venues/:id': 'Delete venue (owner/admin)',
                'GET /api/venues/owner/my': 'Get owner venues',
                'GET /api/venues/meta/types': 'Get venue types',
                'GET /api/venues/meta/locations': 'Get venue locations'
            },
            analytics: {
                'GET /api/analytics/dashboard': 'Admin dashboard analytics',
                'GET /api/analytics/venues/:id': 'Venue-specific analytics',
                'GET /api/analytics/owner/summary': 'Owner summary analytics',
                'POST /api/analytics/venues/:id/rating': 'Submit venue rating',
                'GET /api/analytics/reports/revenue': 'Revenue reports',
                'GET /api/analytics/activity': 'User activity log'
            },
            database: {
                'GET /api/db/tables': 'List database tables (admin)',
                'GET /api/db/table/:name': 'Get table data (admin)',
                'POST /api/db/query': 'Execute SELECT query (admin)',
                'GET /api/db/export': 'Export database (admin)'
            },
            admin: {
                'GET /api/admin/users/search': 'Search users with filters (admin)',
                'GET /api/admin/users/:id': 'Get detailed user info (admin)',
                'PUT /api/admin/users/:id/status': 'Update user status (admin)',
                'GET /api/admin/users/stats/summary': 'Get user statistics (admin)',
                'POST /api/admin/users/bulk-action': 'Bulk user actions (admin)'
            }
        },
        documentation: 'https://github.com/venuespot/api-docs'
    });
});

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Internal server error',
        timestamp: new Date().toISOString(),
        ...(isDevelopment && { stack: err.stack })
    });
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('🚀 Starting VenueSpot API Server...');
        
        // Wait for database initialization
        console.log('📁 Connecting to database...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check database connection
        const stats = await database.getStats();
        console.log('✅ Database connected successfully');
        console.log('📊 Database statistics:');
        console.log(`   Users: ${stats.users.count}`);
        console.log(`   Venues: ${stats.venues.count}`);
        console.log(`   Active Sessions: ${stats.sessions.count}`);
        console.log(`   Analytics Records: ${stats.analytics.count}`);
        
        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log('');
            console.log('🎉 VenueSpot API Server is running!');
            console.log(`📡 Server URL: http://localhost:${PORT}`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
            console.log('');
            console.log('🔗 API Endpoints:');
            console.log(`   Authentication: http://localhost:${PORT}/api/auth`);
            console.log(`   Venues: http://localhost:${PORT}/api/venues`);
            console.log(`   Analytics: http://localhost:${PORT}/api/analytics`);
            console.log('');
            console.log('📝 Sample API calls:');
            console.log(`   curl http://localhost:${PORT}/api/health`);
            console.log(`   curl http://localhost:${PORT}/api/venues`);
            console.log('');
            console.log('💡 Tips:');
            console.log('   - Make sure your frontend is running on port 3000');
            console.log('   - Use the sample credentials to test authentication');
            console.log('   - Check the browser console for any CORS issues');
            console.log('');
        });

        // Graceful shutdown handling
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
            
            server.close(async () => {
                console.log('🔌 HTTP server closed');
                
                try {
                    await database.close();
                    console.log('🗄️  Database connection closed');
                } catch (error) {
                    console.error('❌ Error closing database:', error);
                }
                
                console.log('✅ Server shutdown complete');
                process.exit(0);
            });
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = app;