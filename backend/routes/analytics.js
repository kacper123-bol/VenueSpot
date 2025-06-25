const express = require('express');
const database = require('../database');
const { 
    requireAuth, 
    requireOwnerOrAdmin,
    requireAdmin,
    logActivity 
} = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard - Get dashboard analytics (admin only)
router.get('/dashboard', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        const daysBack = parseInt(period);

        // Basic statistics
        const stats = await database.get(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_users,
                (SELECT COUNT(*) FROM users WHERE user_type = 'customer' AND is_active = 1) as total_customers,
                (SELECT COUNT(*) FROM users WHERE user_type = 'owner' AND is_active = 1) as total_owners,
                (SELECT COUNT(*) FROM venues WHERE is_active = 1) as total_venues,
                (SELECT COUNT(*) FROM sessions WHERE is_active = 1) as active_sessions,
                (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
                (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed') as total_revenue
        `);

        // User registration trends
        const userTrends = await database.all(`
            SELECT 
                date(created_at) as date,
                COUNT(*) as registrations,
                SUM(CASE WHEN user_type = 'customer' THEN 1 ELSE 0 END) as customers,
                SUM(CASE WHEN user_type = 'owner' THEN 1 ELSE 0 END) as owners
            FROM users 
            WHERE created_at >= date('now', '-${daysBack} days')
            GROUP BY date(created_at)
            ORDER BY date
        `);

        // Venue performance
        const venuePerformance = await database.all(`
            SELECT 
                v.name,
                v.type,
                v.location,
                COALESCE(SUM(va.view_count), 0) as total_views,
                COALESCE(SUM(va.booking_requests), 0) as total_bookings,
                COALESCE(AVG(va.customer_ratings), 0) as avg_rating,
                COALESCE(SUM(va.revenue_generated), 0) as total_revenue
            FROM venues v
            LEFT JOIN venue_analytics va ON v.id = va.venue_id
            WHERE v.is_active = 1 AND va.date >= date('now', '-${daysBack} days')
            GROUP BY v.id, v.name, v.type, v.location
            ORDER BY total_views DESC
            LIMIT 20
        `);

        // Popular venue types
        const venueTypes = await database.all(`
            SELECT 
                v.type,
                COUNT(v.id) as venue_count,
                COALESCE(SUM(va.view_count), 0) as total_views,
                COALESCE(SUM(va.booking_requests), 0) as total_bookings
            FROM venues v
            LEFT JOIN venue_analytics va ON v.id = va.venue_id
            WHERE v.is_active = 1 AND (va.date >= date('now', '-${daysBack} days') OR va.date IS NULL)
            GROUP BY v.type
            ORDER BY total_views DESC
        `);

        // Popular locations
        const locations = await database.all(`
            SELECT 
                v.location,
                COUNT(v.id) as venue_count,
                COALESCE(SUM(va.view_count), 0) as total_views,
                COALESCE(SUM(va.booking_requests), 0) as total_bookings
            FROM venues v
            LEFT JOIN venue_analytics va ON v.id = va.venue_id
            WHERE v.is_active = 1 AND (va.date >= date('now', '-${daysBack} days') OR va.date IS NULL)
            GROUP BY v.location
            ORDER BY total_views DESC
        `);

        // Recent activity
        const recentActivity = await database.all(`
            SELECT 
                ua.action,
                ua.created_at,
                u.first_name || ' ' || u.last_name as user_name,
                u.user_type,
                ua.details
            FROM user_activity ua
            LEFT JOIN users u ON ua.user_id = u.id
            WHERE ua.created_at >= datetime('now', '-7 days')
            ORDER BY ua.created_at DESC
            LIMIT 50
        `);

        // Log admin activity
        await logActivity(req.user.id, 'analytics_viewed', { period: daysBack }, req);

        res.json({
            stats,
            trends: {
                userRegistrations: userTrends
            },
            venues: {
                performance: venuePerformance,
                types: venueTypes,
                locations: locations
            },
            recentActivity: recentActivity.map(activity => ({
                ...activity,
                details: activity.details ? JSON.parse(activity.details) : null
            }))
        });

    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
});

// GET /api/analytics/venues/:id - Get specific venue analytics (owner/admin)
router.get('/venues/:id', requireAuth, requireOwnerOrAdmin, async (req, res) => {
    try {
        const venueId = req.params.id;
        const { period = '30' } = req.query;
        const daysBack = parseInt(period);

        // Check if user owns this venue (unless admin)
        if (req.user.userType !== 'admin') {
            const venue = await database.get('SELECT owner_id FROM venues WHERE id = ?', [venueId]);
            if (!venue || venue.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        // Get venue basic info
        const venue = await database.get(`
            SELECT id, name, type, location, price, created_at
            FROM venues 
            WHERE id = ? AND is_active = 1
        `, [venueId]);

        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        // Daily analytics
        const dailyAnalytics = await database.all(`
            SELECT 
                date,
                SUM(view_count) as views,
                SUM(booking_requests) as bookings,
                AVG(customer_ratings) as avg_rating,
                SUM(revenue_generated) as revenue
            FROM venue_analytics
            WHERE venue_id = ? AND date >= date('now', '-${daysBack} days')
            GROUP BY date
            ORDER BY date
        `, [venueId]);

        // Total statistics
        const totalStats = await database.get(`
            SELECT 
                COALESCE(SUM(view_count), 0) as total_views,
                COALESCE(SUM(booking_requests), 0) as total_bookings,
                COALESCE(AVG(customer_ratings), 0) as avg_rating,
                COALESCE(SUM(revenue_generated), 0) as total_revenue,
                COALESCE(SUM(booking_requests) * 100.0 / NULLIF(SUM(view_count), 0), 0) as conversion_rate
            FROM venue_analytics
            WHERE venue_id = ? AND date >= date('now', '-${daysBack} days')
        `, [venueId]);

        // Booking trends
        const bookingTrends = await database.all(`
            SELECT 
                date(created_at) as date,
                COUNT(*) as bookings,
                SUM(total_price) as revenue,
                AVG(total_price) as avg_booking_value
            FROM bookings
            WHERE venue_id = ? AND created_at >= date('now', '-${daysBack} days')
            GROUP BY date(created_at)
            ORDER BY date
        `, [venueId]);

        // Popular time slots (if available)
        const timeSlots = await database.all(`
            SELECT 
                strftime('%H', start_time) as hour,
                COUNT(*) as booking_count
            FROM bookings
            WHERE venue_id = ? AND created_at >= date('now', '-${daysBack} days')
            GROUP BY strftime('%H', start_time)
            ORDER BY booking_count DESC
        `, [venueId]);

        res.json({
            venue,
            period: daysBack,
            analytics: {
                daily: dailyAnalytics,
                totals: totalStats,
                bookingTrends,
                popularTimeSlots: timeSlots
            }
        });

    } catch (error) {
        console.error('Venue analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch venue analytics' });
    }
});

// GET /api/analytics/owner/summary - Get owner's venues summary (owner only)
router.get('/owner/summary', requireAuth, requireOwnerOrAdmin, async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const daysBack = parseInt(period);

        // Owner's venues performance
        const venuesPerformance = await database.all(`
            SELECT 
                v.id,
                v.name,
                v.type,
                v.location,
                COALESCE(SUM(va.view_count), 0) as total_views,
                COALESCE(SUM(va.booking_requests), 0) as total_bookings,
                COALESCE(AVG(va.customer_ratings), 0) as avg_rating,
                COALESCE(SUM(va.revenue_generated), 0) as total_revenue,
                COALESCE(SUM(va.booking_requests) * 100.0 / NULLIF(SUM(va.view_count), 0), 0) as conversion_rate
            FROM venues v
            LEFT JOIN venue_analytics va ON v.id = va.venue_id
            WHERE v.owner_id = ? AND v.is_active = 1 
            AND (va.date >= date('now', '-${daysBack} days') OR va.date IS NULL)
            GROUP BY v.id, v.name, v.type, v.location
            ORDER BY total_views DESC
        `, [req.user.id]);

        // Summary statistics
        const summary = await database.get(`
            SELECT 
                COUNT(DISTINCT v.id) as total_venues,
                COALESCE(SUM(va.view_count), 0) as total_views,
                COALESCE(SUM(va.booking_requests), 0) as total_bookings,
                COALESCE(AVG(va.customer_ratings), 0) as avg_rating,
                COALESCE(SUM(va.revenue_generated), 0) as total_revenue
            FROM venues v
            LEFT JOIN venue_analytics va ON v.id = va.venue_id
            WHERE v.owner_id = ? AND v.is_active = 1 
            AND (va.date >= date('now', '-${daysBack} days') OR va.date IS NULL)
        `, [req.user.id]);

        // Daily performance
        const dailyPerformance = await database.all(`
            SELECT 
                va.date,
                SUM(va.view_count) as views,
                SUM(va.booking_requests) as bookings,
                AVG(va.customer_ratings) as avg_rating,
                SUM(va.revenue_generated) as revenue
            FROM venue_analytics va
            JOIN venues v ON va.venue_id = v.id
            WHERE v.owner_id = ? AND va.date >= date('now', '-${daysBack} days')
            GROUP BY va.date
            ORDER BY va.date
        `, [req.user.id]);

        res.json({
            summary,
            venues: venuesPerformance,
            dailyPerformance,
            period: daysBack
        });

    } catch (error) {
        console.error('Owner summary error:', error);
        res.status(500).json({ error: 'Failed to fetch owner summary' });
    }
});

// POST /api/analytics/venues/:id/rating - Submit venue rating (customer only)
router.post('/venues/:id/rating', requireAuth, async (req, res) => {
    try {
        const venueId = req.params.id;
        const { rating, bookingId } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if venue exists
        const venue = await database.get('SELECT id FROM venues WHERE id = ? AND is_active = 1', [venueId]);
        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        // Verify booking if provided
        if (bookingId) {
            const booking = await database.get(
                'SELECT id FROM bookings WHERE id = ? AND user_id = ? AND venue_id = ? AND status = "completed"',
                [bookingId, req.user.id, venueId]
            );
            if (!booking) {
                return res.status(400).json({ error: 'Invalid booking reference' });
            }
        }

        // Update or insert rating in analytics
        await database.run(`
            INSERT INTO venue_analytics (venue_id, customer_ratings, date) 
            VALUES (?, ?, date('now'))
            ON CONFLICT(venue_id, date) DO UPDATE SET 
                customer_ratings = (customer_ratings + ?) / 2,
                updated_at = CURRENT_TIMESTAMP
        `, [venueId, rating, rating]);

        // Log activity
        await logActivity(req.user.id, 'venue_rated', { 
            venueId: parseInt(venueId), 
            rating,
            bookingId 
        }, req);

        res.json({ message: 'Rating submitted successfully' });

    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

// GET /api/analytics/reports/revenue - Get revenue report (admin only)
router.get('/reports/revenue', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { period = '30', groupBy = 'day' } = req.query;
        const daysBack = parseInt(period);

        let dateFormat;
        switch (groupBy) {
            case 'hour':
                dateFormat = '%Y-%m-%d %H:00:00';
                break;
            case 'day':
                dateFormat = '%Y-%m-%d';
                break;
            case 'week':
                dateFormat = '%Y-W%W';
                break;
            case 'month':
                dateFormat = '%Y-%m';
                break;
            default:
                dateFormat = '%Y-%m-%d';
        }

        const revenueReport = await database.all(`
            SELECT 
                strftime('${dateFormat}', created_at) as period,
                COUNT(*) as total_bookings,
                SUM(total_price) as total_revenue,
                AVG(total_price) as avg_booking_value
            FROM bookings
            WHERE created_at >= date('now', '-${daysBack} days')
            AND status IN ('confirmed', 'completed')
            GROUP BY strftime('${dateFormat}', created_at)
            ORDER BY period
        `);

        // Revenue by venue type
        const revenueByType = await database.all(`
            SELECT 
                v.type,
                COUNT(b.id) as bookings,
                SUM(b.total_price) as revenue,
                AVG(b.total_price) as avg_value
            FROM bookings b
            JOIN venues v ON b.venue_id = v.id
            WHERE b.created_at >= date('now', '-${daysBack} days')
            AND b.status IN ('confirmed', 'completed')
            GROUP BY v.type
            ORDER BY revenue DESC
        `);

        // Top performing venues
        const topVenues = await database.all(`
            SELECT 
                v.id,
                v.name,
                v.type,
                v.location,
                COUNT(b.id) as bookings,
                SUM(b.total_price) as revenue,
                AVG(b.total_price) as avg_value
            FROM bookings b
            JOIN venues v ON b.venue_id = v.id
            WHERE b.created_at >= date('now', '-${daysBack} days')
            AND b.status IN ('confirmed', 'completed')
            GROUP BY v.id, v.name, v.type, v.location
            ORDER BY revenue DESC
            LIMIT 10
        `);

        res.json({
            period: daysBack,
            groupBy,
            revenue: {
                timeline: revenueReport,
                byType: revenueByType,
                topVenues
            }
        });

    } catch (error) {
        console.error('Revenue report error:', error);
        res.status(500).json({ error: 'Failed to generate revenue report' });
    }
});

// GET /api/analytics/activity - Get user activity log (admin only)
router.get('/activity', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { limit = 100, offset = 0, action, userId } = req.query;

        let query = `
            SELECT 
                ua.*,
                u.first_name || ' ' || u.last_name as user_name,
                u.email,
                u.user_type
            FROM user_activity ua
            LEFT JOIN users u ON ua.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (action) {
            query += ' AND ua.action = ?';
            params.push(action);
        }

        if (userId) {
            query += ' AND ua.user_id = ?';
            params.push(parseInt(userId));
        }

        query += ' ORDER BY ua.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const activities = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM user_activity ua WHERE 1=1';
        const countParams = [];

        if (action) {
            countQuery += ' AND ua.action = ?';
            countParams.push(action);
        }

        if (userId) {
            countQuery += ' AND ua.user_id = ?';
            countParams.push(parseInt(userId));
        }

        const { total } = await database.get(countQuery, countParams);

        res.json({
            activities: activities.map(activity => ({
                ...activity,
                details: activity.details ? JSON.parse(activity.details) : null
            })),
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + activities.length < total
            }
        });

    } catch (error) {
        console.error('Activity log error:', error);
        res.status(500).json({ error: 'Failed to fetch activity log' });
    }
});

module.exports = router;