// Database Manager Component - API-based database
const DatabaseManager = {
    baseURL: 'http://localhost:3001/api',
    currentUser: null,
    currentToken: null,
    isInitialized: false,
    
    // API Cache and throttling
    apiCache: new Map(),
    apiThrottleMap: new Map(),
    lastAuthCheck: 0,
    AUTH_CACHE_DURATION: 30000, // 30 seconds
    API_CACHE_DURATION: 10000,  // 10 seconds
    MIN_API_DELAY: 1000,        // 1 second minimum between same requests

    // Initialize database connection
    init: async () => {
        // Prevent multiple initializations
        if (DatabaseManager.isInitialized) {
            return;
        }
        
        DatabaseManager.isInitialized = true;
        console.log('🔄 Initializing DatabaseManager...');
        
        // Load saved session from localStorage
        const savedToken = localStorage.getItem('venuespot_token');
        const savedUser = localStorage.getItem('venuespot_user');
        
        if (savedToken && savedUser) {
            DatabaseManager.currentToken = savedToken;
            DatabaseManager.currentUser = JSON.parse(savedUser);
            
            // Verify session is still valid - but only if we haven't checked recently
            const now = Date.now();
            if (now - DatabaseManager.lastAuthCheck > DatabaseManager.AUTH_CACHE_DURATION) {
                try {
                    console.log('🔐 Verifying saved session...');
                    const response = await DatabaseManager.throttledApiCall('/auth/me', {}, 30000);
                    if (response.user) {
                        DatabaseManager.currentUser = response.user;
                        localStorage.setItem('venuespot_user', JSON.stringify(response.user));
                        DatabaseManager.lastAuthCheck = now;
                    }
                } catch (error) {
                    console.warn('Saved session is invalid, clearing...');
                    DatabaseManager.clearSession();
                }
            } else {
                console.log('🔐 Using cached auth status (recent check)');
            }
        }
        
        console.log('✅ DatabaseManager initialized');
    },

    // Throttled API helper method with caching
    throttledApiCall: async (endpoint, options = {}, cacheTime = null) => {
        const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
        const cacheDuration = cacheTime || DatabaseManager.API_CACHE_DURATION;
        
        // Check cache first
        if (DatabaseManager.apiCache.has(cacheKey)) {
            const cached = DatabaseManager.apiCache.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheDuration) {
                console.log(`📋 Using cached response for ${endpoint}`);
                return cached.data;
            }
        }
        
        // Check if we're already making this request
        if (DatabaseManager.apiThrottleMap.has(cacheKey)) {
            console.log(`⏳ Waiting for existing request to ${endpoint}`);
            return DatabaseManager.apiThrottleMap.get(cacheKey);
        }
        
        // Make the API call
        const promise = DatabaseManager.apiCall(endpoint, options);
        DatabaseManager.apiThrottleMap.set(cacheKey, promise);
        
        try {
            const result = await promise;
            
            // Cache the result
            DatabaseManager.apiCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            return result;
        } catch (error) {
            throw error;
        } finally {
            // Clean up throttle map
            DatabaseManager.apiThrottleMap.delete(cacheKey);
        }
    },

    // Original API helper method
    apiCall: async (endpoint, options = {}) => {
        const url = `${DatabaseManager.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authentication token if available
        if (DatabaseManager.currentToken) {
            headers.Authorization = `Bearer ${DatabaseManager.currentToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 429) {
                    throw new Error('Too many requests. Please wait a moment and try again.');
                }
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call failed: ${endpoint}`, error);
            throw error;
        }
    },

    // Session management
    setSession: (token, user) => {
        DatabaseManager.currentToken = token;
        DatabaseManager.currentUser = user;
        localStorage.setItem('venuespot_token', token);
        localStorage.setItem('venuespot_user', JSON.stringify(user));
    },

    clearSession: () => {
        DatabaseManager.currentToken = null;
        DatabaseManager.currentUser = null;
        DatabaseManager.lastAuthCheck = 0;
        localStorage.removeItem('venuespot_token');
        localStorage.removeItem('venuespot_user');
        DatabaseManager.clearCache();
    },

    getCurrentUser: () => {
        return DatabaseManager.currentUser;
    },

    isAuthenticated: () => {
        return !!DatabaseManager.currentToken && !!DatabaseManager.currentUser;
    },

    // Authentication methods
    auth: {
        // Register new user
        register: async (userData) => {
            const response = await DatabaseManager.apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            return response;
        },

        // User login
        login: async (email, password) => {
            const response = await DatabaseManager.apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.token && response.user) {
                DatabaseManager.setSession(response.token, response.user);
            }

            return response;
        },

        // User logout
        logout: async () => {
            try {
                await DatabaseManager.apiCall('/auth/logout', {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Logout API call failed:', error);
            } finally {
                DatabaseManager.clearSession();
            }
        },

        // Get current user info
        me: async () => {
            return await DatabaseManager.throttledApiCall('/auth/me', {}, DatabaseManager.AUTH_CACHE_DURATION);
        },

        // Change password
        changePassword: async (currentPassword, newPassword) => {
            return await DatabaseManager.apiCall('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword })
            });
        }
    },

    // User management (legacy compatibility)
    users: {
        // Create a new user (now uses register)
        create: async (userData) => {
            return await DatabaseManager.auth.register(userData);
        },

        // Get all users (admin only)
        getAll: async () => {
            return await DatabaseManager.apiCall('/users');
        },

        // Find user by email (for compatibility)
        findByEmail: async (email) => {
            try {
                const users = await DatabaseManager.users.getAll();
                return users.find(user => user.email === email);
            } catch (error) {
                return null;
            }
        },

        // Find user by ID
        findById: async (id) => {
            try {
                return await DatabaseManager.apiCall(`/users/${id}`);
            } catch (error) {
                return null;
            }
        },

        // Update user
        update: async (id, updateData) => {
            return await DatabaseManager.apiCall(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
        },

        // Update last login (handled automatically by backend)
        updateLastLogin: async (id) => {
            // This is now handled automatically by the backend during login
            return true;
        }
    },

    // Session management (now handled by backend)
    sessions: {
        // Get user sessions
        getAll: async () => {
            return await DatabaseManager.apiCall('/auth/sessions');
        },

        // Find session by token (legacy compatibility)
        findByToken: (token) => {
            return DatabaseManager.currentToken === token ? {
                token: DatabaseManager.currentToken,
                userId: DatabaseManager.currentUser?.id,
                isActive: true
            } : null;
        },

        // Deactivate session
        deactivate: async (token) => {
            if (token === DatabaseManager.currentToken) {
                await DatabaseManager.auth.logout();
            } else {
                await DatabaseManager.apiCall(`/auth/sessions/${token}`, {
                    method: 'DELETE'
                });
            }
        },

        // Generate session token (now handled by backend)
        generateToken: () => {
            console.warn('Session token generation is now handled by the backend');
            return null;
        },

        // Cleanup expired sessions (now handled by backend)
        cleanup: async () => {
            // Backend automatically handles session cleanup
            return true;
        }
    },

    // Venues management
    venues: {
        // Create a new venue
        create: async (venueData) => {
            return await DatabaseManager.apiCall('/venues', {
                method: 'POST',
                body: JSON.stringify(venueData)
            });
        },

        // Get all venues
        getAll: async (filters = {}) => {
            const queryParams = new URLSearchParams(filters).toString();
            const endpoint = queryParams ? `/venues?${queryParams}` : '/venues';
            const response = await DatabaseManager.throttledApiCall(endpoint, {}, 15000); // Cache for 15 seconds
            return response.venues || [];
        },

        // Find venue by ID
        findById: async (id) => {
            try {
                const response = await DatabaseManager.apiCall(`/venues/${id}`);
                return response.venue;
            } catch (error) {
                return null;
            }
        },

        // Update venue
        update: async (id, updateData) => {
            return await DatabaseManager.apiCall(`/venues/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
        },

        // Delete venue
        delete: async (id) => {
            await DatabaseManager.apiCall(`/venues/${id}`, {
                method: 'DELETE'
            });
            return true;
        },

        // Get owner's venues
        getMyVenues: async () => {
            const response = await DatabaseManager.apiCall('/venues/owner/my');
            return response.venues || [];
        },

        // Get venue types
        getTypes: async () => {
            const response = await DatabaseManager.apiCall('/venues/meta/types');
            return response.types || [];
        },

        // Get venue locations
        getLocations: async () => {
            const response = await DatabaseManager.apiCall('/venues/meta/locations');
            return response.locations || [];
        }
    },

    // Legacy compatibility - approvedVenues alias
    approvedVenues: {
        create: (venueData) => DatabaseManager.venues.create(venueData),
        getAll: () => DatabaseManager.venues.getAll(),
        findById: (id) => DatabaseManager.venues.findById(id),
        update: (id, updateData) => DatabaseManager.venues.update(id, updateData),
        delete: (id) => DatabaseManager.venues.delete(id)
    },

    // Analytics methods
    analytics: {
        // Get dashboard analytics (admin only)
        getDashboard: async (period = 30) => {
            return await DatabaseManager.throttledApiCall(`/analytics/dashboard?period=${period}`, {}, 20000); // Cache for 20 seconds
        },

        // Get venue analytics
        getVenueAnalytics: async (venueId, period = 30) => {
            return await DatabaseManager.apiCall(`/analytics/venues/${venueId}?period=${period}`);
        },

        // Get owner summary
        getOwnerSummary: async (period = 30) => {
            return await DatabaseManager.apiCall(`/analytics/owner/summary?period=${period}`);
        },

        // Submit venue rating
        submitRating: async (venueId, rating, bookingId = null) => {
            return await DatabaseManager.apiCall(`/analytics/venues/${venueId}/rating`, {
                method: 'POST',
                body: JSON.stringify({ rating, bookingId })
            });
        },

        // Get revenue report (admin only)
        getRevenueReport: async (period = 30, groupBy = 'day') => {
            return await DatabaseManager.apiCall(`/analytics/reports/revenue?period=${period}&groupBy=${groupBy}`);
        },

        // Get activity log (admin only)
        getActivityLog: async (filters = {}) => {
            const queryParams = new URLSearchParams(filters).toString();
            const endpoint = queryParams ? `/analytics/activity?${queryParams}` : '/analytics/activity';
            return await DatabaseManager.apiCall(endpoint);
        }
    },

    // Settings management (legacy compatibility)
    getSettings: () => {
        return {
            sessionTimeout: 24 * 60 * 60 * 1000,
            nextUserId: 1,
            nextVenueId: 1
        };
    },

    updateSettings: (newSettings) => {
        console.warn('Settings are now managed by the backend');
        return newSettings;
    },

    // Utility methods
    clearCache: () => {
        DatabaseManager.apiCache.clear();
        DatabaseManager.apiThrottleMap.clear();
        DatabaseManager.lastAuthCheck = 0;
        console.log('🧹 API cache cleared');
    },
    
    clearAll: async () => {
        console.warn('clearAll is not supported with the backend database');
        DatabaseManager.clearSession();
        DatabaseManager.clearCache();
    },

    // Export data (for backup)
    exportData: async () => {
        try {
            const data = {
                user: DatabaseManager.currentUser,
                venues: await DatabaseManager.venues.getMyVenues(),
                exportedAt: new Date().toISOString()
            };
            return data;
        } catch (error) {
            console.error('Export failed:', error);
            return null;
        }
    },

    // Health check
    healthCheck: async () => {
        try {
            return await DatabaseManager.apiCall('/health');
        } catch (error) {
            return { status: 'ERROR', error: error.message };
        }
    }
};

// Export for use in other modules
window.DatabaseManager = DatabaseManager;