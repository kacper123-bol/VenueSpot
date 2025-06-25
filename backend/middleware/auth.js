const database = require('../database');
const bcrypt = require('bcrypt');

// Authentication middleware
const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication token required' });
        }

        // Find session in database
        const session = await database.get(
            'SELECT s.*, u.id as user_id, u.email, u.first_name, u.last_name, u.user_type FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.is_active = 1',
            [token]
        );

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Check if session is expired
        if (new Date(session.expires_at) < new Date()) {
            // Deactivate expired session
            await database.run('UPDATE sessions SET is_active = 0 WHERE token = ?', [token]);
            return res.status(401).json({ error: 'Session expired' });
        }

        // Add user info to request
        req.user = {
            id: session.user_id,
            email: session.email,
            firstName: session.first_name,
            lastName: session.last_name,
            userType: session.user_type
        };

        req.session = {
            token: session.token,
            expiresAt: session.expires_at
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// Authorization middleware - require specific user type
const requireUserType = (requiredType) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (req.user.userType !== requiredType) {
            return res.status(403).json({ error: `Access denied. ${requiredType} access required.` });
        }

        next();
    };
};

// Specific role requirements
const requireAdmin = requireUserType('admin');
const requireOwner = requireUserType('owner');
const requireCustomer = requireUserType('customer');

// Allow owner or admin
const requireOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.userType !== 'owner' && req.user.userType !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Owner or admin access required.' });
    }

    next();
};

// Check if user owns the resource
const requireOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            
            // Admin can access everything
            if (req.user.userType === 'admin') {
                return next();
            }

            // For venues, check if user is the owner
            if (req.route.path.includes('/venues')) {
                const venue = await database.get('SELECT owner_id FROM venues WHERE id = ?', [resourceId]);
                if (!venue || venue.owner_id !== req.user.id) {
                    return res.status(403).json({ error: 'Access denied. You can only manage your own venues.' });
                }
            }

            // For users, check if accessing own profile
            if (req.route.path.includes('/users')) {
                if (parseInt(resourceId) !== req.user.id) {
                    return res.status(403).json({ error: 'Access denied. You can only access your own profile.' });
                }
            }

            next();
        } catch (error) {
            console.error('Ownership check error:', error);
            res.status(500).json({ error: 'Authorization check failed' });
        }
    };
};

// Optional authentication - adds user info if token present but doesn't require it
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            const session = await database.get(
                'SELECT s.*, u.id as user_id, u.email, u.first_name, u.last_name, u.user_type FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.is_active = 1',
                [token]
            );

            if (session && new Date(session.expires_at) > new Date()) {
                req.user = {
                    id: session.user_id,
                    email: session.email,
                    firstName: session.first_name,
                    lastName: session.last_name,
                    userType: session.user_type
                };
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next(); // Continue without authentication
    }
};

// Password utilities
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Generate session token
const generateSessionToken = () => {
    const { v4: uuidv4 } = require('uuid');
    return `vs_${uuidv4().replace(/-/g, '')}_${Date.now().toString(36)}`;
};

// Log user activity
const logActivity = async (userId, action, details = null, req = null) => {
    try {
        const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
        const userAgent = req?.get('User-Agent') || 'unknown';
        
        await database.run(
            'INSERT INTO user_activity (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
            [userId, action, details ? JSON.stringify(details) : null, ip, userAgent]
        );
    } catch (error) {
        console.error('Activity logging error:', error);
        // Don't throw error for logging failures
    }
};

module.exports = {
    requireAuth,
    requireUserType,
    requireAdmin,
    requireOwner,
    requireCustomer,
    requireOwnerOrAdmin,
    requireOwnership,
    optionalAuth,
    hashPassword,
    verifyPassword,
    generateSessionToken,
    logActivity
};