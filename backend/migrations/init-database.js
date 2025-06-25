const database = require('../database');

const initSchema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_type TEXT CHECK(user_type IN ('customer', 'owner', 'admin')) NOT NULL DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT 1
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    price TEXT NOT NULL,
    discount TEXT,
    availability TEXT,
    description TEXT,
    detailed_description TEXT,
    image_url TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    contact_address TEXT,
    owner_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Analytics table for tracking venue performance
CREATE TABLE IF NOT EXISTS venue_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id INTEGER NOT NULL,
    date DATE DEFAULT (date('now')),
    view_count INTEGER DEFAULT 0,
    booking_requests INTEGER DEFAULT 0,
    conversion_rate REAL DEFAULT 0.0,
    revenue_generated REAL DEFAULT 0.0,
    popular_time_slots TEXT, -- JSON string
    customer_ratings REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

-- User activity log for tracking user behavior
CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT, -- JSON string for additional data
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bookings table for tracking reservations
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venue_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_price REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    special_requests TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues(owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(type);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(location);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_venue_id ON venue_analytics(venue_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON venue_analytics(date);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
`;

const sampleData = `
-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, user_type) 
VALUES (1, 'admin@venuespot.com', '$2b$10$8K1p/a0dPEXkbyCyv8Y7F.YXgvU8h9K2RmT6n4LqXx8hC7vN3jGLa', 'Admin', 'User', 'admin');

-- Insert sample customers
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, user_type) 
VALUES (2, 'john@example.com', '$2b$10$8K1p/a0dPEXkbyCyv8Y7F.YXgvU8h9K2RmT6n4LqXx8hC7vN3jGLa', 'John', 'Doe', 'customer');

INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, user_type) 
VALUES (3, 'jane@example.com', '$2b$10$8K1p/a0dPEXkbyCyv8Y7F.YXgvU8h9K2RmT6n4LqXx8hC7vN3jGLa', 'Jane', 'Smith', 'owner');

INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, user_type) 
VALUES (4, 'mike@example.com', '$2b$10$8K1p/a0dPEXkbyCyv8Y7F.YXgvU8h9K2RmT6n4LqXx8hC7vN3jGLa', 'Mike', 'Johnson', 'customer');

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, description) VALUES 
('session_timeout', '86400000', 'Session timeout in milliseconds (24 hours)'),
('max_login_attempts', '5', 'Maximum login attempts before account lockout'),
('app_name', 'VenueSpot', 'Application name'),
('app_version', '1.0.0', 'Application version'),
('maintenance_mode', 'false', 'Maintenance mode flag');
`;

async function initializeDatabase() {
    try {
        console.log('🔄 Initializing VenueSpot database...');
        
        // Wait for database connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Execute schema
        console.log('📋 Creating database schema...');
        await database.exec(initSchema);
        
        // Insert sample data
        console.log('📊 Inserting sample data...');
        await database.exec(sampleData);
        
        // Get statistics
        const stats = await database.getStats();
        console.log('📈 Database statistics:');
        console.log(`   Users: ${stats.users.count}`);
        console.log(`   Venues: ${stats.venues.count}`);
        console.log(`   Active Sessions: ${stats.sessions.count}`);
        console.log(`   Analytics Records: ${stats.analytics.count}`);
        
        console.log('✅ Database initialization completed successfully!');
        console.log('');
        console.log('📝 Sample login credentials:');
        console.log('   Admin: admin@venuespot.com / admin123');
        console.log('   Customer: john@example.com / password123');
        console.log('   Owner: jane@example.com / password123');
        console.log('   Customer: mike@example.com / password123');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };