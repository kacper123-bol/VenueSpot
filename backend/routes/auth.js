const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database');
const { 
    hashPassword, 
    verifyPassword, 
    generateSessionToken, 
    requireAuth,
    logActivity 
} = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('userType').isIn(['customer', 'owner']).withMessage('User type must be customer or owner')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// POST /api/auth/register - Register new user
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { email, password, firstName, lastName, userType } = req.body;

        // Check if user already exists
        const existingUser = await database.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const result = await database.run(
            'INSERT INTO users (email, password_hash, first_name, last_name, user_type) VALUES (?, ?, ?, ?, ?)',
            [email, passwordHash, firstName, lastName, userType]
        );

        // Log activity
        await logActivity(result.lastID, 'user_registered', { userType, email }, req);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: result.lastID,
                email,
                firstName,
                lastName,
                userType
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login - User login
router.post('/login', loginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await database.get(
            'SELECT id, email, password_hash, first_name, last_name, user_type, is_active FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            await logActivity(null, 'login_failed', { email, reason: 'user_not_found' }, req);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.is_active) {
            await logActivity(user.id, 'login_failed', { email, reason: 'account_inactive' }, req);
            return res.status(401).json({ error: 'Account is inactive' });
        }

        // Verify password
        const passwordValid = await verifyPassword(password, user.password_hash);
        if (!passwordValid) {
            await logActivity(user.id, 'login_failed', { email, reason: 'invalid_password' }, req);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate session token
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create session
        await database.run(
            'INSERT INTO sessions (token, user_id, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
            [sessionToken, user.id, expiresAt.toISOString(), req.ip, req.get('User-Agent')]
        );

        // Update last login
        await database.run(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Log successful login
        await logActivity(user.id, 'login_success', { email }, req);

        res.json({
            message: 'Login successful',
            token: sessionToken,
            expiresAt: expiresAt.toISOString(),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                userType: user.user_type
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/logout - User logout
router.post('/logout', requireAuth, async (req, res) => {
    try {
        // Deactivate current session
        await database.run(
            'UPDATE sessions SET is_active = 0 WHERE token = ?',
            [req.session.token]
        );

        // Log activity
        await logActivity(req.user.id, 'logout', null, req);

        res.json({ message: 'Logout successful' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// GET /api/auth/me - Get current user info
router.get('/me', requireAuth, async (req, res) => {
    try {
        // Get fresh user data
        const user = await database.get(
            'SELECT id, email, first_name, last_name, user_type, created_at, last_login FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                userType: user.user_type,
                createdAt: user.created_at,
                lastLogin: user.last_login
            },
            session: {
                expiresAt: req.session.expiresAt
            }
        });

    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
});

// POST /api/auth/refresh - Refresh session token
router.post('/refresh', requireAuth, async (req, res) => {
    try {
        // Generate new session token
        const newToken = generateSessionToken();
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update existing session
        await database.run(
            'UPDATE sessions SET token = ?, expires_at = ? WHERE token = ?',
            [newToken, newExpiresAt.toISOString(), req.session.token]
        );

        // Log activity
        await logActivity(req.user.id, 'session_refreshed', null, req);

        res.json({
            message: 'Session refreshed successfully',
            token: newToken,
            expiresAt: newExpiresAt.toISOString()
        });

    } catch (error) {
        console.error('Session refresh error:', error);
        res.status(500).json({ error: 'Session refresh failed' });
    }
});

// POST /api/auth/change-password - Change user password
router.post('/change-password', requireAuth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get current user with password hash
        const user = await database.get(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );

        // Verify current password
        const passwordValid = await verifyPassword(currentPassword, user.password_hash);
        if (!passwordValid) {
            await logActivity(req.user.id, 'password_change_failed', { reason: 'invalid_current_password' }, req);
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        await database.run(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [newPasswordHash, req.user.id]
        );

        // Invalidate all other sessions for security
        await database.run(
            'UPDATE sessions SET is_active = 0 WHERE user_id = ? AND token != ?',
            [req.user.id, req.session.token]
        );

        // Log activity
        await logActivity(req.user.id, 'password_changed', null, req);

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Password change failed' });
    }
});

// GET /api/auth/sessions - Get user's active sessions
router.get('/sessions', requireAuth, async (req, res) => {
    try {
        const sessions = await database.all(
            'SELECT token, created_at, expires_at, ip_address, user_agent FROM sessions WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json({
            sessions: sessions.map(session => ({
                token: session.token === req.session.token ? session.token : session.token.substring(0, 10) + '...',
                current: session.token === req.session.token,
                createdAt: session.created_at,
                expiresAt: session.expires_at,
                ipAddress: session.ip_address,
                userAgent: session.user_agent
            }))
        });

    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

// DELETE /api/auth/sessions/:token - Revoke specific session
router.delete('/sessions/:token', requireAuth, async (req, res) => {
    try {
        const tokenToRevoke = req.params.token;
        
        // Don't allow revoking current session via this endpoint
        if (tokenToRevoke === req.session.token) {
            return res.status(400).json({ error: 'Use logout endpoint to revoke current session' });
        }

        // Revoke session (only user's own sessions)
        const result = await database.run(
            'UPDATE sessions SET is_active = 0 WHERE token = ? AND user_id = ?',
            [tokenToRevoke, req.user.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Log activity
        await logActivity(req.user.id, 'session_revoked', { token: tokenToRevoke }, req);

        res.json({ message: 'Session revoked successfully' });

    } catch (error) {
        console.error('Session revoke error:', error);
        res.status(500).json({ error: 'Failed to revoke session' });
    }
});

module.exports = router;