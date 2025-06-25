const express = require('express');
const database = require('../database');
const { requireAuth, requireAdmin, logActivity } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users/search - Enhanced user search with filters
router.get('/search', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { 
            query = '', 
            userType = '', 
            status = '', 
            limit = 20, 
            offset = 0, 
            sortBy = 'id', 
            sortOrder = 'asc' 
        } = req.query;

        // Build the WHERE clause
        let whereConditions = ['1=1'];
        const params = [];

        // Search by ID, name, or email
        if (query.trim()) {
            const searchTerm = `%${query.toLowerCase()}%`;
            whereConditions.push(`(
                LOWER(CAST(id AS TEXT)) LIKE ? OR
                LOWER(first_name || ' ' || last_name) LIKE ? OR
                LOWER(email) LIKE ?
            )`);
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Filter by user type
        if (userType) {
            whereConditions.push('user_type = ?');
            params.push(userType);
        }

        // Filter by status
        if (status !== '') {
            whereConditions.push('is_active = ?');
            params.push(parseInt(status));
        }

        // Validate sort column to prevent SQL injection
        const validSortColumns = ['id', 'first_name', 'last_name', 'email', 'user_type', 'created_at', 'is_active'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'id';
        const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        // Build the main query
        const searchQuery = `
            SELECT 
                id, first_name, last_name, email, user_type, 
                created_at, last_login, is_active
            FROM users 
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY ${sortColumn} ${sortDirection}
            LIMIT ? OFFSET ?
        `;

        // Add limit and offset to params
        params.push(parseInt(limit), parseInt(offset));

        // Execute search query
        const users = await database.all(searchQuery, params);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM users 
            WHERE ${whereConditions.join(' AND ')}
        `;
        
        // Remove limit and offset params for count query
        const countParams = params.slice(0, -2);
        const { total } = await database.get(countQuery, countParams);

        // Log admin search activity
        await logActivity(req.user.id, 'admin_search_users', { 
            query, 
            userType, 
            status, 
            resultsCount: users.length 
        }, req);

        res.json({
            users,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + users.length < total
            },
            searchParams: {
                query,
                userType,
                status,
                sortBy: sortColumn,
                sortOrder: sortDirection
            }
        });

    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

// GET /api/admin/users/:id - Get detailed user information
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Get user details
        const user = await database.get(`
            SELECT 
                id, first_name, last_name, email, user_type,
                created_at, last_login, is_active,
                (SELECT COUNT(*) FROM venues WHERE owner_id = users.id) as venue_count,
                (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as booking_count
            FROM users 
            WHERE id = ?
        `, [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's venues if they're an owner
        let venues = [];
        if (user.user_type === 'owner') {
            venues = await database.all(`
                SELECT id, name, type, location, price, created_at, is_active
                FROM venues 
                WHERE owner_id = ?
                ORDER BY created_at DESC
            `, [userId]);
        }

        // Get user's recent bookings if they're a customer
        let bookings = [];
        if (user.user_type === 'customer') {
            bookings = await database.all(`
                SELECT 
                    b.id, b.start_time, b.end_time, b.total_price, b.status, b.created_at,
                    v.name as venue_name, v.type as venue_type
                FROM bookings b
                JOIN venues v ON b.venue_id = v.id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC
                LIMIT 10
            `, [userId]);
        }

        // Get recent activity
        const activity = await database.all(`
            SELECT action, created_at, ip_address, details
            FROM user_activity
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 20
        `, [userId]);

        // Log admin view activity
        await logActivity(req.user.id, 'admin_view_user', { 
            viewedUserId: parseInt(userId),
            viewedUserEmail: user.email 
        }, req);

        res.json({
            user,
            venues,
            bookings,
            activity: activity.map(act => ({
                ...act,
                details: act.details ? JSON.parse(act.details) : null
            }))
        });

    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ error: 'Failed to get user details' });
    }
});

// PUT /api/admin/users/:id/status - Update user status
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: 'isActive must be a boolean' });
        }

        // Get current user info
        const user = await database.get('SELECT first_name, last_name, email, is_active FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user status
        await database.run('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId]);

        // If deactivating user, also deactivate their active sessions
        if (!isActive) {
            await database.run('UPDATE sessions SET is_active = 0 WHERE user_id = ?', [userId]);
        }

        // Log admin action
        await logActivity(req.user.id, `admin_${isActive ? 'activate' : 'deactivate'}_user`, {
            targetUserId: parseInt(userId),
            targetUserEmail: user.email,
            previousStatus: user.is_active,
            newStatus: isActive
        }, req);

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            userId: parseInt(userId),
            isActive
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// GET /api/admin/users/stats/summary - Get user statistics summary
router.get('/stats/summary', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const daysBack = parseInt(period);

        // Basic user statistics
        const stats = await database.get(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN user_type = 'customer' THEN 1 ELSE 0 END) as customers,
                SUM(CASE WHEN user_type = 'owner' THEN 1 ELSE 0 END) as owners,
                SUM(CASE WHEN user_type = 'admin' THEN 1 ELSE 0 END) as admins,
                SUM(CASE WHEN created_at >= date('now', '-${daysBack} days') THEN 1 ELSE 0 END) as new_users_period
            FROM users
        `);

        // User registration trends
        const trends = await database.all(`
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

        // Top active users (by booking count)
        const topUsers = await database.all(`
            SELECT 
                u.id, u.first_name, u.last_name, u.email, u.user_type,
                COUNT(b.id) as booking_count,
                COALESCE(SUM(b.total_price), 0) as total_spent
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            WHERE u.user_type = 'customer' AND u.is_active = 1
            GROUP BY u.id, u.first_name, u.last_name, u.email, u.user_type
            HAVING booking_count > 0
            ORDER BY booking_count DESC, total_spent DESC
            LIMIT 10
        `);

        // Log admin stats view
        await logActivity(req.user.id, 'admin_view_user_stats', { period: daysBack }, req);

        res.json({
            stats,
            trends,
            topUsers,
            period: daysBack
        });

    } catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({ error: 'Failed to get user statistics' });
    }
});

// POST /api/admin/users/bulk-action - Perform bulk actions on users
router.post('/bulk-action', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { userIds, action } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'userIds must be a non-empty array' });
        }

        if (!['activate', 'deactivate', 'export'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        const results = [];

        switch (action) {
            case 'activate':
            case 'deactivate':
                const isActive = action === 'activate' ? 1 : 0;
                
                for (const userId of userIds) {
                    try {
                        // Get user info for logging
                        const user = await database.get('SELECT email FROM users WHERE id = ?', [userId]);
                        if (user) {
                            await database.run('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
                            
                            // If deactivating, also deactivate sessions
                            if (!isActive) {
                                await database.run('UPDATE sessions SET is_active = 0 WHERE user_id = ?', [userId]);
                            }
                            
                            results.push({ userId, status: 'success', email: user.email });
                        } else {
                            results.push({ userId, status: 'not_found' });
                        }
                    } catch (error) {
                        results.push({ userId, status: 'error', error: error.message });
                    }
                }
                break;

            case 'export':
                const users = await database.all(`
                    SELECT id, first_name, last_name, email, user_type, created_at, last_login, is_active
                    FROM users 
                    WHERE id IN (${userIds.map(() => '?').join(',')})
                `, userIds);
                
                return res.json({
                    action: 'export',
                    users,
                    exportedAt: new Date().toISOString(),
                    exportedBy: req.user.email
                });
        }

        // Log bulk action
        await logActivity(req.user.id, `admin_bulk_${action}_users`, {
            userIds,
            resultsCount: results.length,
            successCount: results.filter(r => r.status === 'success').length
        }, req);

        res.json({
            action,
            results,
            summary: {
                total: results.length,
                successful: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status !== 'success').length
            }
        });

    } catch (error) {
        console.error('Bulk action error:', error);
        res.status(500).json({ error: 'Failed to perform bulk action' });
    }
});

module.exports = router;