// Authentication Manager Component
const AuthManager = {
    currentUser: null,
    currentSession: null,
    isInitialized: false,

    // Initialize authentication system
    init: async () => {
        // Prevent multiple initializations
        if (AuthManager.isInitialized) {
            console.log('🔐 AuthManager already initialized');
            return;
        }
        
        AuthManager.isInitialized = true;
        console.log('🔐 Initializing AuthManager...');
        
        try {
            // Initialize database connection
            await DatabaseManager.init();
            
            // Check for existing session
            await AuthManager.checkExistingSession();
            
            // Clean up expired sessions periodically (handled by backend now)
            // Reduced frequency to prevent excessive API calls
            setInterval(async () => {
                try {
                    await DatabaseManager.sessions.cleanup();
                } catch (error) {
                    console.warn('Session cleanup failed:', error);
                }
            }, 10 * 60 * 1000); // Every 10 minutes (reduced from 5)
            
            console.log('✅ AuthManager initialized');
        } catch (error) {
            console.error('AuthManager initialization failed:', error);
            AuthManager.isInitialized = false; // Reset on error
        }
    },

    // Check if user has existing valid session
    checkExistingSession: async () => {
        try {
            if (DatabaseManager.isAuthenticated()) {
                AuthManager.currentUser = DatabaseManager.getCurrentUser();
                AuthManager.currentSession = { token: DatabaseManager.currentToken };
                AuthManager.updateUI();
                return true;
            }
        } catch (error) {
            console.warn('Session check failed:', error);
            DatabaseManager.clearSession();
        }
        return false;
    },

    // Register new user
    register: async (userData) => {
        try {
            // Validate input
            AuthManager.validateRegistrationData(userData);
            
            // Register user via API
            const response = await DatabaseManager.auth.register(userData);
            
            // Auto-login after successful registration
            if (response.user) {
                const loginResponse = await DatabaseManager.auth.login(userData.email, userData.password);
                if (loginResponse.user) {
                    AuthManager.currentUser = loginResponse.user;
                    AuthManager.currentSession = { token: loginResponse.token };
                    AuthManager.updateUI();
                }
            }
            
            return {
                success: true,
                user: response.user,
                message: 'Registration successful!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Login user
    login: async (email, password) => {
        try {
            // Login via API
            const response = await DatabaseManager.auth.login(email, password);
            
            // Set current user and session
            AuthManager.currentUser = response.user;
            AuthManager.currentSession = {
                token: response.token,
                expiresAt: response.expiresAt
            };
            
            // Update UI
            AuthManager.updateUI();
            
            return {
                success: true,
                user: AuthManager.currentUser,
                message: 'Login successful!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Logout user
    logout: async () => {
        try {
            // Logout via API
            await DatabaseManager.auth.logout();
            
            // Clear current user and session
            AuthManager.currentUser = null;
            AuthManager.currentSession = null;
            
            // Update UI
            AuthManager.updateUI();
            
            return {
                success: true,
                message: 'Logged out successfully!'
            };
        } catch (error) {
            // Even if API call fails, clear local session
            DatabaseManager.clearSession();
            AuthManager.currentUser = null;
            AuthManager.currentSession = null;
            AuthManager.updateUI();
            
            return {
                success: true,
                message: 'Logged out successfully!'
            };
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return DatabaseManager.isAuthenticated() && AuthManager.currentUser !== null;
    },

    // Get current user
    getCurrentUser: () => {
        return AuthManager.currentUser || DatabaseManager.getCurrentUser();
    },

    // Validate registration data
    validateRegistrationData: (userData) => {
        if (!userData.email || !userData.email.includes('@')) {
            throw new Error('Valid email is required');
        }
        
        if (!userData.password || userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        
        if (!userData.firstName || userData.firstName.trim().length === 0) {
            throw new Error('First name is required');
        }
        
        if (!userData.lastName || userData.lastName.trim().length === 0) {
            throw new Error('Last name is required');
        }
        
        if (!userData.userType || !['customer', 'owner', 'admin'].includes(userData.userType)) {
            throw new Error('Valid user type is required');
        }
    },

    // Update UI based on authentication status
    updateUI: () => {
        const isAuth = AuthManager.isAuthenticated();
        const user = AuthManager.getCurrentUser();
        
        // Update navigation
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            if (isAuth) {
                const adminLink = user.userType === 'admin' ? '<li><a href="admin-dashboard.html">🛡️ Admin</a></li>' : '';
                ;
                // Show authenticated navigation
                navLinks.innerHTML = `
                    <li><a href="#marketplace">Marketplace</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#contact">Contact</a></li>
                    ${adminLink}
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle">
                            👋 ${user.firstName} ${user.lastName}
                        </a>
                        <div class="dropdown-menu">
                            <a href="#" onclick="AuthManager.showProfile()">Profile</a>
                            <a href="#" onclick="AuthManager.showDashboard()">Dashboard</a>
                            <a href="#" onclick="AuthManager.logout()">Logout</a>
                        </div>
                    </li>
                `;
            } else {
                // Show default navigation
                navLinks.innerHTML = `
                    <li><a href="#marketplace">Marketplace</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="#" onclick="ModalManager.open('loginModal')">Login</a></li>
                `;
            }
        }
        
        // Update CTA buttons based on user type
        if (isAuth && user.userType === 'owner') {
            const ctaButtons = document.querySelector('.cta-buttons');
            if (ctaButtons) {
                ctaButtons.innerHTML = `
                    <button class="btn btn-primary" onclick="ModalManager.open('ownerModal')">Add New Venue</button>
                    <button class="btn btn-secondary" onclick="AuthManager.showDashboard()">Manage Venues</button>
                `;
            }
        }
    },

    // Show user profile
    showProfile: () => {
        ModalManager.open('profileModal');
        if (window.App && typeof App.handleModalOpened === 'function') {
            App.handleModalOpened('profileModal');
        }
    },

    // Show user dashboard
    showDashboard: () => {
        console.log('Dashboard functionality will be implemented');
        alert('Dashboard coming soon!');
    },

    // Get user statistics (now async)
    getUserStats: async () => {
        try {
            // This now requires admin access, so we'll return basic stats for non-admins
            const user = AuthManager.getCurrentUser();
            if (!user) {
                return {
                    totalUsers: 0,
                    activeUsers: 0,
                    customers: 0,
                    owners: 0,
                    admins: 0,
                    activeSessions: 0
                };
            }

            if (user.userType === 'admin') {
                const dashboard = await DatabaseManager.analytics.getDashboard();
                return {
                    totalUsers: dashboard.stats.total_users,
                    activeUsers: dashboard.stats.total_users, // Assuming all users are active
                    customers: dashboard.stats.total_customers,
                    owners: dashboard.stats.total_owners,
                    admins: 1, // At least one admin (current user)
                    activeSessions: dashboard.stats.active_sessions
                };
            } else {
                return {
                    totalUsers: 'N/A',
                    activeUsers: 'N/A',
                    customers: 'N/A',
                    owners: 'N/A',
                    admins: 'N/A',
                    activeSessions: 1 // At least current session
                };
            }
        } catch (error) {
            console.error('Failed to get user stats:', error);
            return {
                totalUsers: 0,
                activeUsers: 0,
                customers: 0,
                owners: 0,
                admins: 0,
                activeSessions: 0
            };
        }
    },

    // Show registration form
    showRegisterForm: () => {
        ModalManager.close('loginModal');
        ModalManager.open('registerModal');
    },

    // Show login form
    showLoginForm: () => {
        ModalManager.close('registerModal');
        ModalManager.open('loginModal');
    },

    // Show change password form
    showChangePasswordForm: () => {
        ModalManager.open('changePasswordModal');
    },

    // Populate profile form with user data
    populateProfileForm: () => {
        const user = AuthManager.getCurrentUser();
        if (user) {
            document.getElementById('profileFirstName').value = user.firstName || '';
            document.getElementById('profileLastName').value = user.lastName || '';
            document.getElementById('profileEmail').value = user.email || '';
            document.getElementById('profileUserType').value = user.userType === 'owner' ? 'Venue Owner' : 'Customer';
            document.getElementById('profileCreatedAt').value = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
        }
    },

    // Update user profile
    updateProfile: async (formData) => {
        try {
            const user = AuthManager.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const updateData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim()
            };

            // Validate data
            if (!updateData.firstName || !updateData.lastName) {
                throw new Error('First name and last name are required');
            }

            // Update user in database via API
            const response = await DatabaseManager.users.update(user.id, updateData);
            
            // Update current user
            AuthManager.currentUser = { ...AuthManager.currentUser, ...updateData };
            
            // Update UI
            AuthManager.updateUI();

            return {
                success: true,
                message: 'Profile updated successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        try {
            if (!AuthManager.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            if (!newPassword || newPassword.length < 6) {
                throw new Error('New password must be at least 6 characters long');
            }

            // Change password via API
            await DatabaseManager.auth.changePassword(currentPassword, newPassword);

            return {
                success: true,
                message: 'Password changed successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Get user sessions
    getUserSessions: async () => {
        try {
            if (!AuthManager.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            const response = await DatabaseManager.sessions.getAll();
            return response.sessions || [];
        } catch (error) {
            console.error('Failed to get user sessions:', error);
            return [];
        }
    },

    // Revoke session
    revokeSession: async (token) => {
        try {
            await DatabaseManager.sessions.deactivate(token);
            return {
                success: true,
                message: 'Session revoked successfully!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Show error message in form
    showError: (formId, message) => {
        const errorElement = document.getElementById(formId + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    },

    // Hide error message in form
    hideError: (formId) => {
        const errorElement = document.getElementById(formId + 'Error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    },

    // Show success message in form
    showSuccess: (formId, message) => {
        const successElement = document.getElementById(formId + 'Success');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
    },

    // Hide success message in form
    hideSuccess: (formId) => {
        const successElement = document.getElementById(formId + 'Success');
        if (successElement) {
            successElement.style.display = 'none';
        }
    }
};

// Export for use in other modules
window.AuthManager = AuthManager;