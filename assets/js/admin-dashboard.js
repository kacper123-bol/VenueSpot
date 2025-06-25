// Admin Dashboard JavaScript
const AdminDashboard = {
    currentUser: null,
    currentTab: 'overview',
    users: [],
    usersPage: 1,
    usersLimit: 20,
    usersTotal: 0,
    sortColumn: 'id',
    sortDirection: 'asc',
    searchQuery: '',
    userTypeFilter: '',
    userStatusFilter: '',
    charts: {},
    isInitialized: false,
    isLoading: false,
    lastDataLoad: {},

    // Utility function for debouncing
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Initialize the dashboard
    init: async () => {
        // Prevent multiple initializations
        if (AdminDashboard.isInitialized) {
            console.log('🛡️ Admin Dashboard already initialized');
            return;
        }
        
        AdminDashboard.isInitialized = true;
        console.log('🛡️ Initializing Admin Dashboard...');
        
        try {
            // Check authentication
            await AdminDashboard.checkAuth();
            
            // Setup event listeners
            AdminDashboard.setupEventListeners();
            
            // Load initial data with debouncing
            await AdminDashboard.loadInitialDataThrottled();
            
            console.log('✅ Admin Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Admin Dashboard:', error);
            AdminDashboard.handleError('Failed to initialize dashboard', error);
            AdminDashboard.isInitialized = false; // Reset on error
        }
    },

    // Check authentication
    checkAuth: async () => {
        try {
            // Get token from localStorage (same as DatabaseManager)
            const token = localStorage.getItem('venuespot_token');
            const savedUser = localStorage.getItem('venuespot_user');
            
            if (!token || !savedUser) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${window.CONFIG.API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Not authenticated');
            }

            const data = await response.json();
            
            if (data.user.userType !== 'admin') {
                throw new Error('Admin access required');
            }

            AdminDashboard.currentUser = data.user;
            document.getElementById('adminUserName').textContent =
                `${data.user.firstName} ${data.user.lastName}`;
            
        } catch (error) {
            console.error('Authentication failed:', error);
            alert('Access denied. Admin privileges required. Please login as an administrator.');
            window.location.href = 'index.html';
        }
    },

    // Setup event listeners
    setupEventListeners: () => {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.dataset.tab;
                AdminDashboard.switchTab(tab);
            });
        });

        // Search input with debouncing
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            const debouncedSearch = AdminDashboard.debounce(AdminDashboard.searchUsers, 500);
            searchInput.addEventListener('input', debouncedSearch);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        AdminDashboard.switchTab('overview');
                        break;
                    case '2':
                        e.preventDefault();
                        AdminDashboard.switchTab('users');
                        break;
                    case '3':
                        e.preventDefault();
                        AdminDashboard.switchTab('analytics');
                        break;
                    case '4':
                        e.preventDefault();
                        AdminDashboard.switchTab('database');
                        break;
                }
            }
        });
    },

    // Load initial data with throttling
    loadInitialDataThrottled: async () => {
        const now = Date.now();
        const cacheKey = 'initialData';
        
        // Check if we loaded data recently
        if (AdminDashboard.lastDataLoad[cacheKey] && 
            now - AdminDashboard.lastDataLoad[cacheKey] < 10000) { // 10 seconds
            console.log('📋 Skipping initial data load (recent cache)');
            return;
        }
        
        AdminDashboard.showLoading(true);
        
        try {
            // Load overview data by default
            await AdminDashboard.loadOverviewDataThrottled();
            await AdminDashboard.loadQuickStatsThrottled();
            AdminDashboard.lastDataLoad[cacheKey] = now;
        } catch (error) {
            console.error('Failed to load initial data:', error);
        } finally {
            AdminDashboard.showLoading(false);
        }
    },

    // Load initial data (original method)
    loadInitialData: async () => {
        AdminDashboard.showLoading(true);
        
        try {
            // Load overview data by default
            await AdminDashboard.loadOverviewData();
            await AdminDashboard.loadQuickStats();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        } finally {
            AdminDashboard.showLoading(false);
        }
    },

    // Switch tabs
    switchTab: async (tabName) => {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        AdminDashboard.currentTab = tabName;

        // Load tab-specific data
        AdminDashboard.showLoading(true);
        try {
            switch (tabName) {
                case 'overview':
                    await AdminDashboard.loadOverviewDataThrottled();
                    break;
                case 'users':
                    await AdminDashboard.loadUsersData();
                    break;
                case 'analytics':
                    await AdminDashboard.loadAnalyticsData();
                    break;
                case 'database':
                    await AdminDashboard.loadDatabaseData();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${tabName} data:`, error);
            AdminDashboard.handleError(`Failed to load ${tabName} data`, error);
        } finally {
            AdminDashboard.showLoading(false);
        }
    },

    // Load overview data with throttling
    loadOverviewDataThrottled: async () => {
        const now = Date.now();
        const cacheKey = 'overviewData';
        
        // Check if we loaded data recently
        if (AdminDashboard.lastDataLoad[cacheKey] && 
            now - AdminDashboard.lastDataLoad[cacheKey] < 15000) { // 15 seconds
            console.log('📋 Skipping overview data load (recent cache)');
            return;
        }
        
        try {
            await AdminDashboard.loadOverviewData();
            AdminDashboard.lastDataLoad[cacheKey] = now;
        } catch (error) {
            console.error('Failed to load overview data:', error);
            throw error;
        }
    },

    // Load overview data
    loadOverviewData: async () => {
        try {
            const period = document.getElementById('overviewPeriod')?.value || '30';
            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/analytics/dashboard?period=${period}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            
            const data = await response.json();
            AdminDashboard.updateOverviewUI(data);
            AdminDashboard.createOverviewCharts(data);
            
        } catch (error) {
            console.error('Failed to load overview data:', error);
            throw error;
        }
    },

    // Update overview UI
    updateOverviewUI: (data) => {
        // Update stats cards
        document.getElementById('totalUsers').textContent = data.stats.total_users || 0;
        document.getElementById('totalVenues').textContent = data.stats.total_venues || 0;
        document.getElementById('totalRevenue').textContent = 
            AdminDashboard.formatCurrency(data.stats.total_revenue || 0);
        document.getElementById('confirmedBookings').textContent = 
            data.stats.confirmed_bookings || 0;

        // Update recent activity
        const activityContainer = document.getElementById('recentActivity');
        if (data.recentActivity && data.recentActivity.length > 0) {
            activityContainer.innerHTML = data.recentActivity.map(activity => `
                <div class="activity-item">
                    <div class="activity-text">
                        <strong>${activity.user_name || 'System'}</strong> - ${activity.action}
                        ${activity.details ? `<br><small>${JSON.stringify(activity.details)}</small>` : ''}
                    </div>
                    <div class="activity-time">${AdminDashboard.formatDate(activity.created_at)}</div>
                </div>
            `).join('');
        } else {
            activityContainer.innerHTML = '<div class="loading">No recent activity</div>';
        }
    },

    // Create overview charts
    createOverviewCharts: (data) => {
        // User trends chart
        const userTrendsCtx = document.getElementById('userTrendsChart');
        if (userTrendsCtx && data.trends.userRegistrations) {
            AdminDashboard.destroyChart('userTrends');
            
            AdminDashboard.charts.userTrends = new Chart(userTrendsCtx, {
                type: 'line',
                data: {
                    labels: data.trends.userRegistrations.map(item => 
                        AdminDashboard.formatDate(item.date)
                    ),
                    datasets: [{
                        label: 'New Registrations',
                        data: data.trends.userRegistrations.map(item => item.registrations),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Venue performance chart
        const venuePerformanceCtx = document.getElementById('venuePerformanceChart');
        if (venuePerformanceCtx && data.venues.performance) {
            AdminDashboard.destroyChart('venuePerformance');
            
            const topVenues = data.venues.performance.slice(0, 10);
            AdminDashboard.charts.venuePerformance = new Chart(venuePerformanceCtx, {
                type: 'bar',
                data: {
                    labels: topVenues.map(venue => venue.name),
                    datasets: [{
                        label: 'Total Views',
                        data: topVenues.map(venue => venue.total_views),
                        backgroundColor: 'rgba(52, 152, 219, 0.8)',
                        borderColor: '#3498db',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },

    // Load quick stats with throttling
    loadQuickStatsThrottled: async () => {
        const now = Date.now();
        const cacheKey = 'quickStats';
        
        // Check if we loaded data recently
        if (AdminDashboard.lastDataLoad[cacheKey] && 
            now - AdminDashboard.lastDataLoad[cacheKey] < 20000) { // 20 seconds
            console.log('📋 Skipping quick stats load (recent cache)');
            return;
        }
        
        try {
            await AdminDashboard.loadQuickStats();
            AdminDashboard.lastDataLoad[cacheKey] = now;
        } catch (error) {
            console.error('Failed to load quick stats:', error);
        }
    },

    // Load quick stats for sidebar
    loadQuickStats: async () => {
        try {
            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/analytics/dashboard?period=7`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch quick stats');
            
            const data = await response.json();
            
            document.getElementById('quickTotalUsers').textContent = data.stats.total_users || 0;
            document.getElementById('quickActiveSessions').textContent = data.stats.active_sessions || 0;
            document.getElementById('quickTotalVenues').textContent = data.stats.total_venues || 0;
            document.getElementById('quickTotalRevenue').textContent =
                AdminDashboard.formatCurrency(data.stats.total_revenue || 0);
                
        } catch (error) {
            console.error('Failed to load quick stats:', error);
        }
    },

    // Load users data
    loadUsersData: async () => {
        try {
            const params = new URLSearchParams({
                limit: AdminDashboard.usersLimit,
                offset: (AdminDashboard.usersPage - 1) * AdminDashboard.usersLimit,
                sortBy: AdminDashboard.sortColumn,
                sortOrder: AdminDashboard.sortDirection
            });

            // Add filters if they exist
            if (AdminDashboard.searchQuery) {
                params.append('query', AdminDashboard.searchQuery);
            }
            if (AdminDashboard.userTypeFilter) {
                params.append('userType', AdminDashboard.userTypeFilter);
            }
            if (AdminDashboard.userStatusFilter !== '') {
                params.append('status', AdminDashboard.userStatusFilter);
            }

            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/admin/users/search?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch users data');
            
            const data = await response.json();
            AdminDashboard.users = data.users || [];
            AdminDashboard.usersTotal = data.pagination.total || 0;
            
            AdminDashboard.renderUsersTable();
            AdminDashboard.updateUsersPagination();
            
        } catch (error) {
            console.error('Failed to load users data:', error);
            throw error;
        }
    },

    // Search users
    searchUsers: async () => {
        AdminDashboard.searchQuery = document.getElementById('userSearch').value.trim();
        AdminDashboard.usersPage = 1; // Reset to first page
        await AdminDashboard.loadUsersData();
    },

    // Filter users
    filterUsers: () => {
        AdminDashboard.userTypeFilter = document.getElementById('userTypeFilter').value;
        AdminDashboard.userStatusFilter = document.getElementById('userStatusFilter').value;
        AdminDashboard.usersPage = 1;
        
        AdminDashboard.loadUsersData();
    },

    // Sort users
    sortUsers: (column) => {
        if (AdminDashboard.sortColumn === column) {
            AdminDashboard.sortDirection = AdminDashboard.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            AdminDashboard.sortColumn = column;
            AdminDashboard.sortDirection = 'asc';
        }

        // Update sort indicators
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.className = 'sort-indicator';
        });
        
        const currentIndicator = document.querySelector(`th[onclick="AdminDashboard.sortUsers('${column}')"] .sort-indicator`);
        if (currentIndicator) {
            currentIndicator.classList.add(AdminDashboard.sortDirection);
        }

        AdminDashboard.loadUsersData();
    },

    // Render users table
    renderUsersTable: () => {
        const tbody = document.getElementById('usersTableBody');
        
        if (!AdminDashboard.users || AdminDashboard.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = AdminDashboard.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td><span class="user-type-badge type-${user.user_type}">${user.user_type}</span></td>
                <td>${AdminDashboard.formatDate(user.created_at)}</td>
                <td><span class="status-badge status-${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="AdminDashboard.viewUserDetails(${user.id})">View</button>
                        <button class="btn-action btn-edit" onclick="AdminDashboard.toggleUserStatus(${user.id}, ${!user.is_active})">${user.is_active ? 'Deactivate' : 'Activate'}</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Update users pagination
    updateUsersPagination: () => {
        const totalPages = Math.ceil(AdminDashboard.usersTotal / AdminDashboard.usersLimit);
        
        document.getElementById('usersCount').textContent = 
            `${AdminDashboard.usersTotal} user${AdminDashboard.usersTotal !== 1 ? 's' : ''}`;
        document.getElementById('usersPageInfo').textContent = 
            `Page ${AdminDashboard.usersPage} of ${totalPages}`;
        
        document.getElementById('prevUsersPage').disabled = AdminDashboard.usersPage <= 1;
        document.getElementById('nextUsersPage').disabled = AdminDashboard.usersPage >= totalPages;
    },

    // Change page
    changePage: (direction) => {
        const newPage = AdminDashboard.usersPage + direction;
        const totalPages = Math.ceil(AdminDashboard.usersTotal / AdminDashboard.usersLimit);
        
        if (newPage >= 1 && newPage <= totalPages) {
            AdminDashboard.usersPage = newPage;
            AdminDashboard.loadUsersData();
        }
    },

    // View user details
    viewUserDetails: async (userId) => {
        try {
            AdminDashboard.showLoading(true);

            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/admin/users/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch user details');
            
            const data = await response.json();
            const user = data.user;

            const modalContent = document.getElementById('userDetailsContent');
            modalContent.innerHTML = `
                <div class="user-details">
                    <div class="detail-section">
                        <h4>Basic Information</h4>
                        <div class="detail-row">
                            <strong>ID:</strong> ${user.id}
                        </div>
                        <div class="detail-row">
                            <strong>Name:</strong> ${user.first_name} ${user.last_name}
                        </div>
                        <div class="detail-row">
                            <strong>Email:</strong> ${user.email}
                        </div>
                        <div class="detail-row">
                            <strong>User Type:</strong> <span class="user-type-badge type-${user.user_type}">${user.user_type}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Status:</strong> <span class="status-badge status-${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Created:</strong> ${AdminDashboard.formatDate(user.created_at)}
                        </div>
                        <div class="detail-row">
                            <strong>Last Login:</strong> ${user.last_login ? AdminDashboard.formatDate(user.last_login) : 'Never'}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Statistics</h4>
                        <div class="detail-row">
                            <strong>Venues Owned:</strong> ${user.venue_count || 0}
                        </div>
                        <div class="detail-row">
                            <strong>Total Bookings:</strong> ${user.booking_count || 0}
                        </div>
                    </div>

                    ${data.venues && data.venues.length > 0 ? `
                        <div class="detail-section">
                            <h4>Venues (${data.venues.length})</h4>
                            <div class="venues-list">
                                ${data.venues.map(venue => `
                                    <div class="venue-item">
                                        <strong>${venue.name}</strong> - ${venue.type}
                                        <br><small>${venue.location} | $${venue.price} | ${venue.is_active ? 'Active' : 'Inactive'}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${data.bookings && data.bookings.length > 0 ? `
                        <div class="detail-section">
                            <h4>Recent Bookings (${data.bookings.length})</h4>
                            <div class="bookings-list">
                                ${data.bookings.map(booking => `
                                    <div class="booking-item">
                                        <strong>${booking.venue_name}</strong> - ${AdminDashboard.formatCurrency(booking.total_price)}
                                        <br><small>${AdminDashboard.formatDate(booking.start_time)} | Status: ${booking.status}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="detail-actions">
                        <button class="btn btn-primary" onclick="AdminDashboard.toggleUserStatus(${user.id}, ${!user.is_active})">
                            ${user.is_active ? 'Deactivate User' : 'Activate User'}
                        </button>
                    </div>
                </div>
            `;

            AdminDashboard.showModal('userDetailsModal');
            
        } catch (error) {
            console.error('Failed to view user details:', error);
            AdminDashboard.handleError('Failed to load user details', error);
        } finally {
            AdminDashboard.showLoading(false);
        }
    },

    // Toggle user status
    toggleUserStatus: async (userId, newStatus) => {
        try {
            const user = AdminDashboard.users.find(u => u.id === userId);
            if (!user) return;

            const action = newStatus ? 'activate' : 'deactivate';
            if (!confirm(`Are you sure you want to ${action} ${user.first_name} ${user.last_name}?`)) {
                return;
            }

            AdminDashboard.showLoading(true);

            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/admin/users/${userId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isActive: newStatus })
                }
            );

            if (!response.ok) throw new Error('Failed to update user status');
            
            const data = await response.json();
            
            // Refresh users list to show updated status
            await AdminDashboard.loadUsersData();
            
            // Close modal if open
            AdminDashboard.closeModal('userDetailsModal');
            
            // Show success message
            alert(`User ${action}d successfully!`);
            
        } catch (error) {
            console.error('Failed to toggle user status:', error);
            AdminDashboard.handleError('Failed to update user status', error);
        } finally {
            AdminDashboard.showLoading(false);
        }
    },

    // Load analytics data
    loadAnalyticsData: async () => {
        try {
            const period = document.getElementById('analyticsPeriod')?.value || '30';
            
            const token = localStorage.getItem('venuespot_token');
            
            // Load revenue data
            const revenueResponse = await fetch(
                `${window.CONFIG.API_BASE_URL}/analytics/reports/revenue?period=${period}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!revenueResponse.ok) throw new Error('Failed to fetch revenue data');
            const revenueData = await revenueResponse.json();

            // Load dashboard analytics
            const dashboardResponse = await fetch(
                `${window.CONFIG.API_BASE_URL}/analytics/dashboard?period=${period}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard analytics');
            const dashboardData = await dashboardResponse.json();

            AdminDashboard.createAnalyticsCharts(revenueData, dashboardData);
            
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            throw error;
        }
    },

    // Create analytics charts
    createAnalyticsCharts: (revenueData, dashboardData) => {
        // Revenue chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx && revenueData.revenue.timeline) {
            AdminDashboard.destroyChart('revenue');
            
            AdminDashboard.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: revenueData.revenue.timeline.map(item => item.period),
                    datasets: [{
                        label: 'Revenue',
                        data: revenueData.revenue.timeline.map(item => item.total_revenue),
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return AdminDashboard.formatCurrency(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Activity chart
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx && dashboardData.trends.userRegistrations) {
            AdminDashboard.destroyChart('activity');
            
            AdminDashboard.charts.activity = new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: dashboardData.trends.userRegistrations.map(item => 
                        AdminDashboard.formatDate(item.date)
                    ),
                    datasets: [{
                        label: 'New Users',
                        data: dashboardData.trends.userRegistrations.map(item => item.registrations),
                        backgroundColor: 'rgba(155, 89, 182, 0.8)',
                        borderColor: '#9b59b6',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Venue types chart
        const venueTypesCtx = document.getElementById('venueTypesChart');
        if (venueTypesCtx && dashboardData.venues.types) {
            AdminDashboard.destroyChart('venueTypes');
            
            AdminDashboard.charts.venueTypes = new Chart(venueTypesCtx, {
                type: 'doughnut',
                data: {
                    labels: dashboardData.venues.types.map(item => item.type),
                    datasets: [{
                        data: dashboardData.venues.types.map(item => item.venue_count),
                        backgroundColor: [
                            '#3498db', '#e74c3c', '#f39c12', '#27ae60', 
                            '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Locations chart
        const locationsCtx = document.getElementById('locationsChart');
        if (locationsCtx && dashboardData.venues.locations) {
            AdminDashboard.destroyChart('locations');
            
            const topLocations = dashboardData.venues.locations.slice(0, 8);
            AdminDashboard.charts.locations = new Chart(locationsCtx, {
                type: 'bar',
                data: {
                    labels: topLocations.map(item => item.location),
                    datasets: [{
                        label: 'Venues',
                        data: topLocations.map(item => item.venue_count),
                        backgroundColor: 'rgba(52, 152, 219, 0.8)',
                        borderColor: '#3498db',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },

    // Load database data
    loadDatabaseData: async () => {
        try {
            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/db/tables`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch database tables');
            
            const data = await response.json();
            AdminDashboard.renderDatabaseTables(data.tables);
            
        } catch (error) {
            console.error('Failed to load database data:', error);
            throw error;
        }
    },

    // Render database tables
    renderDatabaseTables: (tables) => {
        const container = document.getElementById('databaseTables');
        
        if (!tables || tables.length === 0) {
            container.innerHTML = '<div class="loading">No tables found</div>';
            return;
        }

        container.innerHTML = tables.map(table => `
            <div class="table-card" onclick="AdminDashboard.viewTableData('${table.name}')">
                <div class="table-name">${table.name}</div>
                <div class="table-count">${table.count} records</div>
            </div>
        `).join('');
    },

    // View table data
    viewTableData: async (tableName) => {
        try {
            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/db/table/${tableName}?limit=50`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch table data');
            
            const data = await response.json();
            AdminDashboard.displayTableData(data);
            
        } catch (error) {
            console.error('Failed to view table data:', error);
            AdminDashboard.handleError('Failed to load table data', error);
        }
    },

    // Display table data
    displayTableData: (data) => {
        const resultsContainer = document.getElementById('queryResults');
        
        if (!data.data || data.data.length === 0) {
            resultsContainer.innerHTML = '<p>No data found in table.</p>';
            return;
        }

        // Create table HTML
        const columns = data.columns.map(col => col.name);
        const tableHTML = `
            <div class="table-info">
                <h4>Table: ${data.table}</h4>
                <p>Showing ${data.data.length} of ${data.pagination.total} records</p>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map(row => `
                            <tr>
                                ${columns.map(col => `<td>${AdminDashboard.formatCellValue(row[col])}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        resultsContainer.innerHTML = tableHTML;
    },

    // Execute custom query
    executeQuery: async () => {
        const query = document.getElementById('sqlQuery').value.trim();
        
        if (!query) {
            alert('Please enter a SQL query');
            return;
        }

        if (!query.toLowerCase().startsWith('select')) {
            alert('Only SELECT queries are allowed for security reasons');
            return;
        }

        try {
            AdminDashboard.showLoading(true);
            
            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/db/query`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sql: query })
                }
            );

            if (!response.ok) throw new Error('Query execution failed');
            
            const data = await response.json();
            AdminDashboard.displayQueryResults(data);
            
        } catch (error) {
            console.error('Query execution failed:', error);
            AdminDashboard.handleError('Query execution failed', error);
        } finally {
            AdminDashboard.showLoading(false);
        }
    },

    // Display query results
    displayQueryResults: (data) => {
        const resultsContainer = document.getElementById('queryResults');
        
        if (!data.results || data.results.length === 0) {
            resultsContainer.innerHTML = '<p>Query executed successfully but returned no results.</p>';
            return;
        }

        // Get column names from first result
        const columns = Object.keys(data.results[0]);
        
        const tableHTML = `
            <div class="query-info">
                <p><strong>Query:</strong> ${data.query}</p>
                <p><strong>Results:</strong> ${data.count} rows</p>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.results.map(row => `
                            <tr>
                                ${columns.map(col => `<td>${AdminDashboard.formatCellValue(row[col])}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        resultsContainer.innerHTML = tableHTML;
    },

    // Export functions
    exportUsers: async () => {
        try {
            AdminDashboard.showLoading(true);

            // Get all current users (respecting current filters)
            const userIds = AdminDashboard.users.map(user => user.id);
            
            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/admin/users/bulk-action`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userIds,
                        action: 'export'
                    })
                }
            );

            if (!response.ok) throw new Error('Export failed');
            
            const data = await response.json();
            AdminDashboard.downloadJSON(data.users, 'users-export.json');
            
        } catch (error) {
            console.error('Export failed:', error);
            AdminDashboard.handleError('Export failed', error);
        } finally {
            AdminDashboard.showLoading(false);
        }
    },

    exportDatabase: async () => {
        try {
            const token = localStorage.getItem('venuespot_token');
            
            const response = await fetch(
                `${window.CONFIG.API_BASE_URL}/db/export`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Database export failed');
            
            const data = await response.json();
            AdminDashboard.downloadJSON(data, 'venuespot-database-export.json');
            
        } catch (error) {
            console.error('Database export failed:', error);
            AdminDashboard.handleError('Database export failed', error);
        }
    },

    // Refresh functions with throttling
    refreshOverview: AdminDashboard.debounce(() => {
        AdminDashboard.loadOverviewDataThrottled();
        AdminDashboard.loadQuickStatsThrottled();
    }, 2000),

    refreshUsers: AdminDashboard.debounce(() => {
        AdminDashboard.loadUsersData();
    }, 1000),

    refreshAnalytics: AdminDashboard.debounce(() => {
        AdminDashboard.loadAnalyticsData();
    }, 2000),

    refreshDatabase: AdminDashboard.debounce(() => {
        AdminDashboard.loadDatabaseData();
    }, 1000),

    // Utility functions
    formatDate: (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    },

    formatCellValue: (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'string' && value.length > 100) {
            return value.substring(0, 100) + '...';
        }
        return value;
    },

    downloadJSON: (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    showLoading: (show) => {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    },

    showModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    closeModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    destroyChart: (chartName) => {
        if (AdminDashboard.charts[chartName]) {
            AdminDashboard.charts[chartName].destroy();
            delete AdminDashboard.charts[chartName];
        }
    },

    handleError: (message, error) => {
        console.error(message, error);
        alert(`${message}: ${error.message || 'Unknown error'}`);
    },

    logout: async () => {
        try {
            const token = localStorage.getItem('venuespot_token');
            
            await fetch(`${window.CONFIG.API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Clear stored session data
            localStorage.removeItem('venuespot_token');
            localStorage.removeItem('venuespot_user');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            window.location.href = 'index.html';
        }
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', AdminDashboard.init);

// Handle window resize for charts
window.addEventListener('resize', () => {
    Object.values(AdminDashboard.charts).forEach(chart => {
        if (chart && chart.resize) {
            chart.resize();
        }
    });
});