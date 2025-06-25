// Admin Management Component
const AdminManager = {
    currentAdminUser: null,
    
    // Initialize admin system
    init: () => {
        // Initialize admin-specific database collections
        AdminManager.initAdminDatabase();
        
        // Check if current user is admin
        AdminManager.checkAdminAccess();
        
        console.log('AdminManager initialized');
    },

    // Initialize admin database collections
    initAdminDatabase: () => {
        if (!localStorage.getItem('venuespot_admin_logs')) {
            localStorage.setItem('venuespot_admin_logs', JSON.stringify([]));
        }
        if (!localStorage.getItem('venuespot_reports')) {
            localStorage.setItem('venuespot_reports', JSON.stringify([]));
        }
        if (!localStorage.getItem('venuespot_pending_venues')) {
            localStorage.setItem('venuespot_pending_venues', JSON.stringify([]));
        }
        if (!localStorage.getItem('venuespot_system_settings')) {
            localStorage.setItem('venuespot_system_settings', JSON.stringify({
                approvalRequired: true,
                maxVenuesPerOwner: 5,
                sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
                maintenanceMode: false
            }));
        }
    },

    // Check if current user has admin access
    checkAdminAccess: () => {
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser && currentUser.userType === 'admin') {
            AdminManager.currentAdminUser = currentUser;
            AdminManager.updateAdminUI();
            return true;
        }
        return false;
    },

    // Check if user is admin
    isAdmin: () => {
        const currentUser = AuthManager.getCurrentUser();
        return currentUser && currentUser.userType === 'admin';
    },

    // Show admin dashboard
    showAdminDashboard: () => {
        if (!AdminManager.isAdmin()) {
            alert('Access denied. Admin privileges required.');
            return;
        }
        
        // Create admin dashboard modal if it doesn't exist
        if (!document.getElementById('adminDashboardModal')) {
            const modalHTML = AdminManager.createAdminDashboardModal();
            document.getElementById('modalsContainer').insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Populate dashboard with current data
        AdminManager.populateAdminDashboard();
        
        // Open the modal
        ModalManager.open('adminDashboardModal');
    },

    // Create admin dashboard modal HTML
    createAdminDashboardModal: () => {
        return `
            <div class="modal" id="adminDashboardModal">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2>🛡️ Admin Dashboard</h2>
                        <span class="close" onclick="ModalManager.close('adminDashboardModal')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="admin-tabs">
                            <button class="tab-button active" onclick="AdminManager.showTab('overview')">📊 Overview</button>
                            <button class="tab-button" onclick="AdminManager.showTab('users')">👥 Users</button>
                            <button class="tab-button" onclick="AdminManager.showTab('venues')">🏢 Venues</button>
                            <button class="tab-button" onclick="AdminManager.showTab('analytics')">📈 Analytics</button>
                            <button class="tab-button" onclick="AdminManager.showTab('settings')">⚙️ Settings</button>
                        </div>
                        
                        <div class="admin-content">
                            <!-- Overview Tab -->
                            <div id="overview-tab" class="tab-content active">
                                <h3>System Overview</h3>
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-number" id="totalUsers">0</div>
                                        <div class="stat-label">Total Users</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number" id="activeUsers">0</div>
                                        <div class="stat-label">Active Users</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number" id="totalVenues">0</div>
                                        <div class="stat-label">Total Venues</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number" id="pendingVenues">0</div>
                                        <div class="stat-label">Pending Venues</div>
                                    </div>
                                </div>
                                
                                <div class="recent-activity">
                                    <h4>Recent Activity</h4>
                                    <div id="recentActivity" class="activity-list">
                                        <!-- Activity items will be populated here -->
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Users Tab -->
                            <div id="users-tab" class="tab-content">
                                <h3>User Management</h3>
                                <div class="user-controls">
                                    <button class="btn btn-primary" onclick="AdminManager.createAdminUser()">➕ Create Admin</button>
                                    <button class="btn btn-secondary" onclick="AdminManager.refreshUserList()">🔄 Refresh</button>
                                    <select id="userTypeFilter" onchange="AdminManager.filterUsers()">
                                        <option value="all">All Users</option>
                                        <option value="customer">Customers</option>
                                        <option value="owner">Owners</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                </div>
                                <div id="usersList" class="admin-list">
                                    <!-- Users will be populated here -->
                                </div>
                            </div>
                            
                            <!-- Venues Tab -->
                            <div id="venues-tab" class="tab-content">
                                <h3>Venue Management</h3>
                                <div class="venue-controls">
                                    <button class="btn btn-primary" onclick="AdminManager.showPendingVenues()">⏳ Pending Approval</button>
                                    <button class="btn btn-secondary" onclick="AdminManager.showAllVenues()">🏢 All Venues</button>
                                    <button class="btn btn-secondary" onclick="AdminManager.refreshVenueList()">🔄 Refresh</button>
                                </div>
                                <div id="venuesList" class="admin-list">
                                    <!-- Venues will be populated here -->
                                </div>
                            </div>
                            
                            <!-- Analytics Tab -->
                            <div id="analytics-tab" class="tab-content">
                                <h3>System Analytics</h3>
                                <div class="analytics-grid">
                                    <div class="analytics-card">
                                        <h4>User Statistics</h4>
                                        <div id="userStats">
                                            <!-- User stats will be populated here -->
                                        </div>
                                    </div>
                                    <div class="analytics-card">
                                        <h4>Venue Statistics</h4>
                                        <div id="venueStats">
                                            <!-- Venue stats will be populated here -->
                                        </div>
                                    </div>
                                    <div class="analytics-card">
                                        <h4>Activity Trends</h4>
                                        <div id="activityTrends">
                                            <!-- Activity trends will be populated here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Settings Tab -->
                            <div id="settings-tab" class="tab-content">
                                <h3>System Settings</h3>
                                <div class="settings-form">
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="approvalRequired" onchange="AdminManager.updateSetting('approvalRequired', this.checked)">
                                            Venue Approval Required
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>Max Venues Per Owner:</label>
                                        <input type="number" id="maxVenuesPerOwner" min="1" max="50" onchange="AdminManager.updateSetting('maxVenuesPerOwner', this.value)">
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="maintenanceMode" onchange="AdminManager.updateSetting('maintenanceMode', this.checked)">
                                            Maintenance Mode
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <button class="btn btn-primary" onclick="AdminManager.exportSystemData()">📥 Export Data</button>
                                        <button class="btn btn-secondary" onclick="AdminManager.clearAllData()">🗑️ Clear All Data</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Show specific tab in admin dashboard
    showTab: (tabName) => {
        // Hide all tabs
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => button.classList.remove('active'));
        
        // Show selected tab
        document.getElementById(tabName + '-tab').classList.add('active');
        event.target.classList.add('active');
        
        // Load tab-specific data
        switch(tabName) {
            case 'overview':
                AdminManager.loadOverviewData();
                break;
            case 'users':
                AdminManager.loadUsersData();
                break;
            case 'venues':
                AdminManager.loadVenuesData();
                break;
            case 'analytics':
                AdminManager.loadAnalyticsData();
                break;
            case 'settings':
                AdminManager.loadSettingsData();
                break;
        }
    },

    // Populate admin dashboard with current data
    populateAdminDashboard: () => {
        AdminManager.loadOverviewData();
    },

    // Load overview data
    loadOverviewData: () => {
        const stats = AdminManager.getSystemStats();
        
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('activeUsers').textContent = stats.activeUsers;
        document.getElementById('totalVenues').textContent = stats.totalVenues;
        document.getElementById('pendingVenues').textContent = stats.pendingVenues;
        
        // Load recent activity
        const recentActivity = AdminManager.getRecentActivity();
        const activityContainer = document.getElementById('recentActivity');
        activityContainer.innerHTML = recentActivity.map(activity => `
            <div class="activity-item">
                <span class="activity-time">${activity.time}</span>
                <span class="activity-text">${activity.text}</span>
            </div>
        `).join('');
    },

    // Load users data
    loadUsersData: () => {
        AdminManager.refreshUserList();
    },

    // Load venues data
    loadVenuesData: () => {
        AdminManager.refreshVenueList();
    },

    // Load analytics data
    loadAnalyticsData: () => {
        const userStats = AdminManager.getUserAnalytics();
        const venueStats = AdminManager.getVenueAnalytics();
        const activityTrends = AdminManager.getActivityTrends();
        
        document.getElementById('userStats').innerHTML = AdminManager.formatUserStats(userStats);
        document.getElementById('venueStats').innerHTML = AdminManager.formatVenueStats(venueStats);
        document.getElementById('activityTrends').innerHTML = AdminManager.formatActivityTrends(activityTrends);
    },

    // Load settings data
    loadSettingsData: () => {
        const settings = AdminManager.getSystemSettings();
        
        document.getElementById('approvalRequired').checked = settings.approvalRequired;
        document.getElementById('maxVenuesPerOwner').value = settings.maxVenuesPerOwner;
        document.getElementById('maintenanceMode').checked = settings.maintenanceMode;
    },

    // Get system statistics
    getSystemStats: () => {
        const users = DatabaseManager.users.getAll();
        const venues = DatabaseManager.approvedVenues.getAll();
        const pendingVenues = AdminManager.getPendingVenues();
        
        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive).length,
            customers: users.filter(u => u.userType === 'customer').length,
            owners: users.filter(u => u.userType === 'owner').length,
            admins: users.filter(u => u.userType === 'admin').length,
            totalVenues: venues.length,
            activeVenues: venues.filter(v => v.isActive).length,
            pendingVenues: pendingVenues.length
        };
    },

    // Get recent activity
    getRecentActivity: () => {
        const logs = AdminManager.getAdminLogs();
        return logs.slice(-10).reverse().map(log => ({
            time: new Date(log.timestamp).toLocaleString(),
            text: log.action
        }));
    },

    // Refresh user list
    refreshUserList: () => {
        const users = DatabaseManager.users.getAll();
        const usersList = document.getElementById('usersList');
        
        usersList.innerHTML = users.map(user => `
            <div class="admin-item">
                <div class="item-info">
                    <strong>${user.firstName} ${user.lastName}</strong>
                    <span class="user-type">${user.userType}</span>
                    <span class="user-email">${user.email}</span>
                    <span class="user-status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}" onclick="AdminManager.toggleUserStatus(${user.id})">
                        ${user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-info" onclick="AdminManager.viewUserDetails(${user.id})">View</button>
                    <button class="btn btn-sm btn-danger" onclick="AdminManager.deleteUser(${user.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    // Refresh venue list
    refreshVenueList: () => {
        const venues = DatabaseManager.approvedVenues.getAll();
        const venuesList = document.getElementById('venuesList');
        
        venuesList.innerHTML = venues.map(venue => `
            <div class="admin-item">
                <div class="item-info">
                    <strong>${venue.name}</strong>
                    <span class="venue-type">${venue.type}</span>
                    <span class="venue-location">${venue.location}</span>
                    <span class="venue-status ${venue.isActive ? 'active' : 'inactive'}">${venue.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm ${venue.isActive ? 'btn-warning' : 'btn-success'}" onclick="AdminManager.toggleVenueStatus(${venue.id})">
                        ${venue.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-info" onclick="AdminManager.editVenue(${venue.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="AdminManager.deleteVenue(${venue.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    // Toggle user status
    toggleUserStatus: (userId) => {
        const user = DatabaseManager.users.findById(userId);
        if (user) {
            const newStatus = !user.isActive;
            DatabaseManager.users.update(userId, { isActive: newStatus });
            
            AdminManager.logAdminAction(`${newStatus ? 'Activated' : 'Deactivated'} user: ${user.email}`);
            AdminManager.refreshUserList();
            AdminManager.loadOverviewData();
        }
    },

    // Toggle venue status
    toggleVenueStatus: (venueId) => {
        const venue = DatabaseManager.approvedVenues.findById(venueId);
        if (venue) {
            const newStatus = !venue.isActive;
            DatabaseManager.approvedVenues.update(venueId, { isActive: newStatus });
            
            AdminManager.logAdminAction(`${newStatus ? 'Activated' : 'Deactivated'} venue: ${venue.name}`);
            AdminManager.refreshVenueList();
            AdminManager.loadOverviewData();
            
            // Refresh venue display
            VenueManager.renderVenues();
        }
    },

    // Delete user
    deleteUser: (userId) => {
        const user = DatabaseManager.users.findById(userId);
        if (user && confirm(`Are you sure you want to delete user: ${user.email}?`)) {
            // Remove user from database
            const users = DatabaseManager.users.getAll();
            const filteredUsers = users.filter(u => u.id !== userId);
            localStorage.setItem('venuespot_users', JSON.stringify(filteredUsers));
            
            AdminManager.logAdminAction(`Deleted user: ${user.email}`);
            AdminManager.refreshUserList();
            AdminManager.loadOverviewData();
        }
    },

    // Delete venue
    deleteVenue: (venueId) => {
        const venue = DatabaseManager.approvedVenues.findById(venueId);
        if (venue && confirm(`Are you sure you want to delete venue: ${venue.name}?`)) {
            DatabaseManager.approvedVenues.delete(venueId);
            
            AdminManager.logAdminAction(`Deleted venue: ${venue.name}`);
            AdminManager.refreshVenueList();
            AdminManager.loadOverviewData();
            
            // Refresh venue display
            VenueManager.renderVenues();
        }
    },

    // Create admin user
    createAdminUser: () => {
        const email = prompt('Enter admin email:');
        const firstName = prompt('Enter admin first name:');
        const lastName = prompt('Enter admin last name:');
        
        if (email && firstName && lastName) {
            try {
                const adminUser = DatabaseManager.users.create({
                    email: email,
                    password: 'admin123', // Default password
                    firstName: firstName,
                    lastName: lastName,
                    userType: 'admin'
                });
                
                AdminManager.logAdminAction(`Created admin user: ${email}`);
                AdminManager.refreshUserList();
                AdminManager.loadOverviewData();
                
                alert(`Admin user created successfully!\nEmail: ${email}\nPassword: admin123\n\nPlease change the password after first login.`);
            } catch (error) {
                alert('Error creating admin user: ' + error.message);
            }
        }
    },

    // Get user analytics
    getUserAnalytics: () => {
        const users = DatabaseManager.users.getAll();
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return {
            totalUsers: users.length,
            newUsersThisWeek: users.filter(u => new Date(u.createdAt) > oneWeekAgo).length,
            customerCount: users.filter(u => u.userType === 'customer').length,
            ownerCount: users.filter(u => u.userType === 'owner').length,
            adminCount: users.filter(u => u.userType === 'admin').length,
            activeUsers: users.filter(u => u.isActive).length
        };
    },

    // Get venue analytics
    getVenueAnalytics: () => {
        const venues = DatabaseManager.approvedVenues.getAll();
        const venuesByType = {};
        const venuesByLocation = {};
        
        venues.forEach(venue => {
            venuesByType[venue.type] = (venuesByType[venue.type] || 0) + 1;
            venuesByLocation[venue.location] = (venuesByLocation[venue.location] || 0) + 1;
        });
        
        return {
            totalVenues: venues.length,
            activeVenues: venues.filter(v => v.isActive).length,
            venuesByType: venuesByType,
            venuesByLocation: venuesByLocation
        };
    },

    // Get activity trends
    getActivityTrends: () => {
        const logs = AdminManager.getAdminLogs();
        const sessions = DatabaseManager.sessions.getAll();
        
        return {
            totalAdminActions: logs.length,
            activeSessions: sessions.filter(s => s.isActive && new Date(s.expiresAt) > new Date()).length,
            recentActions: logs.slice(-5).map(log => ({
                action: log.action,
                time: new Date(log.timestamp).toLocaleString()
            }))
        };
    },

    // Format user stats for display
    formatUserStats: (stats) => {
        return `
            <div class="stat-row">
                <span>Total Users:</span>
                <span>${stats.totalUsers}</span>
            </div>
            <div class="stat-row">
                <span>New This Week:</span>
                <span>${stats.newUsersThisWeek}</span>
            </div>
            <div class="stat-row">
                <span>Customers:</span>
                <span>${stats.customerCount}</span>
            </div>
            <div class="stat-row">
                <span>Owners:</span>
                <span>${stats.ownerCount}</span>
            </div>
            <div class="stat-row">
                <span>Admins:</span>
                <span>${stats.adminCount}</span>
            </div>
            <div class="stat-row">
                <span>Active Users:</span>
                <span>${stats.activeUsers}</span>
            </div>
        `;
    },

    // Format venue stats for display
    formatVenueStats: (stats) => {
        const typeStats = Object.entries(stats.venuesByType)
            .map(([type, count]) => `<div class="stat-row"><span>${type}:</span><span>${count}</span></div>`)
            .join('');
            
        return `
            <div class="stat-row">
                <span>Total Venues:</span>
                <span>${stats.totalVenues}</span>
            </div>
            <div class="stat-row">
                <span>Active Venues:</span>
                <span>${stats.activeVenues}</span>
            </div>
            <h5>By Type:</h5>
            ${typeStats}
        `;
    },

    // Format activity trends for display
    formatActivityTrends: (trends) => {
        const recentActions = trends.recentActions
            .map(action => `<div class="activity-item"><span>${action.time}</span><span>${action.action}</span></div>`)
            .join('');
            
        return `
            <div class="stat-row">
                <span>Total Admin Actions:</span>
                <span>${trends.totalAdminActions}</span>
            </div>
            <div class="stat-row">
                <span>Active Sessions:</span>
                <span>${trends.activeSessions}</span>
            </div>
            <h5>Recent Actions:</h5>
            <div class="activity-list">
                ${recentActions}
            </div>
        `;
    },

    // Update system setting
    updateSetting: (key, value) => {
        const settings = AdminManager.getSystemSettings();
        settings[key] = value;
        localStorage.setItem('venuespot_system_settings', JSON.stringify(settings));
        
        AdminManager.logAdminAction(`Updated setting: ${key} = ${value}`);
    },

    // Get system settings
    getSystemSettings: () => {
        return JSON.parse(localStorage.getItem('venuespot_system_settings') || '{}');
    },

    // Export system data
    exportSystemData: () => {
        const data = DatabaseManager.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `venuespot_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        AdminManager.logAdminAction('Exported system data');
    },

    // Clear all data
    clearAllData: () => {
        if (confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
            if (confirm('This will delete all users, venues, and settings. Are you absolutely sure?')) {
                DatabaseManager.clearAll();
                AdminManager.logAdminAction('Cleared all system data');
                alert('All data has been cleared. The page will now reload.');
                window.location.reload();
            }
        }
    },

    // Get pending venues
    getPendingVenues: () => {
        return JSON.parse(localStorage.getItem('venuespot_pending_venues') || '[]');
    },

    // Log admin action
    logAdminAction: (action) => {
        const logs = AdminManager.getAdminLogs();
        const currentUser = AuthManager.getCurrentUser();
        
        logs.push({
            timestamp: new Date().toISOString(),
            adminId: currentUser ? currentUser.id : 'unknown',
            adminEmail: currentUser ? currentUser.email : 'unknown',
            action: action
        });
        
        localStorage.setItem('venuespot_admin_logs', JSON.stringify(logs));
    },

    // Get admin logs
    getAdminLogs: () => {
        return JSON.parse(localStorage.getItem('venuespot_admin_logs') || '[]');
    },

    // Update admin UI
    updateAdminUI: () => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && AdminManager.isAdmin()) {
            // Add admin dashboard link
            const adminLink = document.createElement('li');
            adminLink.innerHTML = '<a href="#" onclick="AdminManager.showAdminDashboard()">🛡️ Admin</a>';
            navLinks.appendChild(adminLink);
        }
    },

    // Filter users
    filterUsers: () => {
        const filter = document.getElementById('userTypeFilter').value;
        const users = DatabaseManager.users.getAll();
        let filteredUsers = users;
        
        if (filter !== 'all') {
            filteredUsers = users.filter(user => user.userType === filter);
        }
        
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = filteredUsers.map(user => `
            <div class="admin-item">
                <div class="item-info">
                    <strong>${user.firstName} ${user.lastName}</strong>
                    <span class="user-type">${user.userType}</span>
                    <span class="user-email">${user.email}</span>
                    <span class="user-status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}" onclick="AdminManager.toggleUserStatus(${user.id})">
                        ${user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-info" onclick="AdminManager.viewUserDetails(${user.id})">View</button>
                    <button class="btn btn-sm btn-danger" onclick="AdminManager.deleteUser(${user.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    // View user details
    viewUserDetails: (userId) => {
        const user = DatabaseManager.users.findById(userId);
        if (user) {
            alert(`User Details:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nType: ${user.userType}\nStatus: ${user.isActive ? 'Active' : 'Inactive'}\nCreated: ${new Date(user.createdAt).toLocaleString()}\nLast Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}`);
        }
    },

    // Edit venue
    editVenue: (venueId) => {
        const venue = DatabaseManager.approvedVenues.findById(venueId);
        if (venue) {
            const newName = prompt('Enter new venue name:', venue.name);
            const newPrice = prompt('Enter new price:', venue.price);
            
            if (newName && newPrice) {
                DatabaseManager.approvedVenues.update(venueId, {
                    name: newName,
                    price: newPrice
                });
                
                AdminManager.logAdminAction(`Edited venue: ${venue.name}`);
                AdminManager.refreshVenueList();
                VenueManager.renderVenues();
            }
        }
    },

    // Show pending venues
    showPendingVenues: () => {
        const pendingVenues = AdminManager.getPendingVenues();
        const venuesList = document.getElementById('venuesList');
        
        if (pendingVenues.length === 0) {
            venuesList.innerHTML = '<div class="no-data">No pending venues</div>';
            return;
        }
        
        venuesList.innerHTML = pendingVenues.map(venue => `
            <div class="admin-item pending">
                <div class="item-info">
                    <strong>${venue.name}</strong>
                    <span class="venue-type">${venue.type}</span>
                    <span class="venue-location">${venue.location}</span>
                    <span class="venue-status pending">Pending Approval</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-success" onclick="AdminManager.approveVenue(${venue.id})">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="AdminManager.rejectVenue(${venue.id})">Reject</button>
                    <button class="btn btn-sm btn-info" onclick="AdminManager.viewVenueDetails(${venue.id})">View</button>
                </div>
            </div>
        `).join('');
    },

    // Show all venues
    showAllVenues: () => {
        AdminManager.refreshVenueList();
    },

    // Approve venue
    approveVenue: (venueId) => {
        const pendingVenues = AdminManager.getPendingVenues();
        const venue = pendingVenues.find(v => v.id === venueId);
        
        if (venue) {
            // Add to approved venues
            DatabaseManager.approvedVenues.create(venue);
            
            // Remove from pending
            const updatedPending = pendingVenues.filter(v => v.id !== venueId);
            localStorage.setItem('venuespot_pending_venues', JSON.stringify(updatedPending));
            
            AdminManager.logAdminAction(`Approved venue: ${venue.name}`);
            AdminManager.showPendingVenues();
            AdminManager.loadOverviewData();
            VenueManager.renderVenues();
        }
    },

    // Reject venue
    rejectVenue: (venueId) => {
        const pendingVenues = AdminManager.getPendingVenues();
        const venue = pendingVenues.find(v => v.id === venueId);
        
        if (venue && confirm(`Are you sure you want to reject venue: ${venue.name}?`)) {
            // Remove from pending
            const updatedPending = pendingVenues.filter(v => v.id !== venueId);
            localStorage.setItem('venuespot_pending_venues', JSON.stringify(updatedPending));
            
            AdminManager.logAdminAction(`Rejected venue: ${venue.name}`);
            AdminManager.showPendingVenues();
            AdminManager.loadOverviewData();
        }
    },

    // View venue details
    viewVenueDetails: (venueId) => {
        const pendingVenues = AdminManager.getPendingVenues();
        const venue = pendingVenues.find(v => v.id === venueId);
        
        if (venue) {
            alert(`Venue Details:\n\nName: ${venue.name}\nType: ${venue.type}\nLocation: ${venue.location}\nPrice: ${venue.price}\nDescription: ${venue.description}\nContact: ${venue.contact ? venue.contact.email : 'N/A'}`);
        }
    }
};

// Export for use in other modules
window.AdminManager = AdminManager;