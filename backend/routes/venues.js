const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database');
const { 
    requireAuth, 
    requireOwnerOrAdmin, 
    requireOwnership,
    optionalAuth,
    logActivity 
} = require('../middleware/auth');

const router = express.Router();

// Validation rules
const venueValidation = [
    body('name').trim().isLength({ min: 1 }).withMessage('Venue name is required'),
    body('type').trim().isLength({ min: 1 }).withMessage('Venue type is required'),
    body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
    body('price').trim().isLength({ min: 1 }).withMessage('Price is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('contactPhone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('contactEmail').optional().isEmail().withMessage('Valid email required')
];

// GET /api/venues - Get all venues (public)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { 
            type, 
            location, 
            minPrice, 
            maxPrice, 
            hasDiscount, 
            limit = 50, 
            offset = 0,
            search 
        } = req.query;

        let query = `
            SELECT v.*, u.first_name || ' ' || u.last_name as owner_name
            FROM venues v 
            LEFT JOIN users u ON v.owner_id = u.id 
            WHERE v.is_active = 1
        `;
        const params = [];

        // Add filters
        if (type) {
            query += ' AND v.type LIKE ?';
            params.push(`%${type}%`);
        }

        if (location) {
            query += ' AND v.location LIKE ?';
            params.push(`%${location}%`);
        }

        if (search) {
            query += ' AND (v.name LIKE ? OR v.description LIKE ? OR v.type LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (hasDiscount === 'true') {
            query += ' AND v.discount IS NOT NULL AND v.discount != ""';
        }

        // Price filtering (extract numeric value from price string)
        if (minPrice) {
            query += ' AND CAST(REPLACE(REPLACE(v.price, "$", ""), "/hr", "") AS INTEGER) >= ?';
            params.push(parseInt(minPrice));
        }

        if (maxPrice) {
            query += ' AND CAST(REPLACE(REPLACE(v.price, "$", ""), "/hr", "") AS INTEGER) <= ?';
            params.push(parseInt(maxPrice));
        }

        query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const venues = await database.all(query, params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM venues v WHERE v.is_active = 1';
        const countParams = [];

        if (type) {
            countQuery += ' AND v.type LIKE ?';
            countParams.push(`%${type}%`);
        }

        if (location) {
            countQuery += ' AND v.location LIKE ?';
            countParams.push(`%${location}%`);
        }

        if (search) {
            countQuery += ' AND (v.name LIKE ? OR v.description LIKE ? OR v.type LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (hasDiscount === 'true') {
            countQuery += ' AND v.discount IS NOT NULL AND v.discount != ""';
        }

        if (minPrice) {
            countQuery += ' AND CAST(REPLACE(REPLACE(v.price, "$", ""), "/hr", "") AS INTEGER) >= ?';
            countParams.push(parseInt(minPrice));
        }

        if (maxPrice) {
            countQuery += ' AND CAST(REPLACE(REPLACE(v.price, "$", ""), "/hr", "") AS INTEGER) <= ?';
            countParams.push(parseInt(maxPrice));
        }

        const { total } = await database.get(countQuery, countParams);

        // Log venue browsing activity if user is authenticated
        if (req.user) {
            await logActivity(req.user.id, 'venues_browsed', { 
                filters: { type, location, search, hasDiscount },
                resultCount: venues.length 
            }, req);
        }

        res.json({
            venues,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + venues.length < total
            }
        });

    } catch (error) {
        console.error('Get venues error:', error);
        res.status(500).json({ error: 'Failed to fetch venues' });
    }
});

// GET /api/venues/:id - Get specific venue (public)
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const venueId = req.params.id;

        const venue = await database.get(`
            SELECT v.*, u.first_name || ' ' || u.last_name as owner_name, u.email as owner_email
            FROM venues v 
            LEFT JOIN users u ON v.owner_id = u.id 
            WHERE v.id = ? AND v.is_active = 1
        `, [venueId]);

        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        // Get venue analytics
        const analytics = await database.get(`
            SELECT 
                SUM(view_count) as total_views,
                SUM(booking_requests) as total_bookings,
                AVG(customer_ratings) as avg_rating,
                SUM(revenue_generated) as total_revenue
            FROM venue_analytics 
            WHERE venue_id = ?
        `, [venueId]);

        // Update view count
        if (req.user) {
            await database.run(`
                INSERT INTO venue_analytics (venue_id, view_count, date) 
                VALUES (?, 1, date('now'))
                ON CONFLICT(venue_id, date) DO UPDATE SET 
                    view_count = view_count + 1,
                    updated_at = CURRENT_TIMESTAMP
            `, [venueId]);

            // Log activity
            await logActivity(req.user.id, 'venue_viewed', { venueId, venueName: venue.name }, req);
        }

        res.json({
            venue,
            analytics: {
                totalViews: analytics?.total_views || 0,
                totalBookings: analytics?.total_bookings || 0,
                avgRating: analytics?.avg_rating || 0,
                totalRevenue: analytics?.total_revenue || 0
            }
        });

    } catch (error) {
        console.error('Get venue error:', error);
        res.status(500).json({ error: 'Failed to fetch venue' });
    }
});

// POST /api/venues - Create new venue (owner/admin only)
router.post('/', requireAuth, requireOwnerOrAdmin, venueValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const {
            name,
            type,
            location,
            price,
            discount,
            availability,
            description,
            detailedDescription,
            imageUrl,
            contactPhone,
            contactEmail,
            contactAddress
        } = req.body;

        // Create venue
        const result = await database.run(`
            INSERT INTO venues (
                name, type, location, price, discount, availability, 
                description, detailed_description, image_url, 
                contact_phone, contact_email, contact_address, owner_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name, type, location, price, discount, availability,
            description, detailedDescription, imageUrl,
            contactPhone, contactEmail, contactAddress, req.user.id
        ]);

        // Log activity
        await logActivity(req.user.id, 'venue_created', { 
            venueId: result.lastID, 
            venueName: name,
            venueType: type 
        }, req);

        res.status(201).json({
            message: 'Venue created successfully',
            venue: {
                id: result.lastID,
                name,
                type,
                location,
                price,
                discount,
                availability,
                description
            }
        });

    } catch (error) {
        console.error('Create venue error:', error);
        res.status(500).json({ error: 'Failed to create venue' });
    }
});

// PUT /api/venues/:id - Update venue (owner/admin only)
router.put('/:id', requireAuth, requireOwnerOrAdmin, requireOwnership('id'), venueValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const venueId = req.params.id;
        const {
            name,
            type,
            location,
            price,
            discount,
            availability,
            description,
            detailedDescription,
            imageUrl,
            contactPhone,
            contactEmail,
            contactAddress
        } = req.body;

        // Update venue
        const result = await database.run(`
            UPDATE venues SET 
                name = ?, type = ?, location = ?, price = ?, discount = ?, 
                availability = ?, description = ?, detailed_description = ?, 
                image_url = ?, contact_phone = ?, contact_email = ?, 
                contact_address = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_active = 1
        `, [
            name, type, location, price, discount, availability,
            description, detailedDescription, imageUrl,
            contactPhone, contactEmail, contactAddress, venueId
        ]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        // Log activity
        await logActivity(req.user.id, 'venue_updated', { 
            venueId: parseInt(venueId), 
            venueName: name 
        }, req);

        res.json({
            message: 'Venue updated successfully',
            venue: {
                id: parseInt(venueId),
                name,
                type,
                location,
                price,
                discount,
                availability,
                description
            }
        });

    } catch (error) {
        console.error('Update venue error:', error);
        res.status(500).json({ error: 'Failed to update venue' });
    }
});

// DELETE /api/venues/:id - Delete venue (owner/admin only)
router.delete('/:id', requireAuth, requireOwnerOrAdmin, requireOwnership('id'), async (req, res) => {
    try {
        const venueId = req.params.id;

        // Get venue info for logging
        const venue = await database.get('SELECT name FROM venues WHERE id = ?', [venueId]);
        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        // Soft delete venue
        const result = await database.run(`
            UPDATE venues SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND is_active = 1
        `, [venueId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        // Log activity
        await logActivity(req.user.id, 'venue_deleted', { 
            venueId: parseInt(venueId), 
            venueName: venue.name 
        }, req);

        res.json({ message: 'Venue deleted successfully' });

    } catch (error) {
        console.error('Delete venue error:', error);
        res.status(500).json({ error: 'Failed to delete venue' });
    }
});

// GET /api/venues/owner/my - Get current user's venues (owner only)
router.get('/owner/my', requireAuth, requireOwnerOrAdmin, async (req, res) => {
    try {
        const venues = await database.all(`
            SELECT v.*, 
                   COALESCE(SUM(va.view_count), 0) as total_views,
                   COALESCE(SUM(va.booking_requests), 0) as total_bookings,
                   COALESCE(AVG(va.customer_ratings), 0) as avg_rating
            FROM venues v 
            LEFT JOIN venue_analytics va ON v.id = va.venue_id
            WHERE v.owner_id = ? AND v.is_active = 1
            GROUP BY v.id
            ORDER BY v.created_at DESC
        `, [req.user.id]);

        res.json({ venues });

    } catch (error) {
        console.error('Get owner venues error:', error);
        res.status(500).json({ error: 'Failed to fetch your venues' });
    }
});

// GET /api/venues/types - Get venue types (public)
router.get('/meta/types', async (req, res) => {
    try {
        const types = await database.all(`
            SELECT type, COUNT(*) as count 
            FROM venues 
            WHERE is_active = 1 
            GROUP BY type 
            ORDER BY count DESC, type ASC
        `);

        res.json({ types });

    } catch (error) {
        console.error('Get venue types error:', error);
        res.status(500).json({ error: 'Failed to fetch venue types' });
    }
});

// GET /api/venues/locations - Get venue locations (public)
router.get('/meta/locations', async (req, res) => {
    try {
        const locations = await database.all(`
            SELECT location, COUNT(*) as count 
            FROM venues 
            WHERE is_active = 1 
            GROUP BY location 
            ORDER BY count DESC, location ASC
        `);

        res.json({ locations });

    } catch (error) {
        console.error('Get venue locations error:', error);
        res.status(500).json({ error: 'Failed to fetch venue locations' });
    }
});

module.exports = router;