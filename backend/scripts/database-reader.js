const database = require('../database');

// Database Reader Script - View and query your VenueSpot database
class DatabaseReader {
    
    // View all tables
    async showTables() {
        console.log('📋 Database Tables:');
        console.log('==================');
        
        const tables = await database.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);
        
        for (const table of tables) {
            const count = await database.get(`SELECT COUNT(*) as count FROM ${table.name}`);
            console.log(`📊 ${table.name}: ${count.count} records`);
        }
        console.log('');
    }

    // View table structure
    async describeTable(tableName) {
        console.log(`🏗️  Table Structure: ${tableName}`);
        console.log('================================');
        
        const columns = await database.all(`PRAGMA table_info(${tableName})`);
        
        console.log('Columns:');
        columns.forEach(col => {
            const nullable = col.notnull ? 'NOT NULL' : 'NULL';
            const pk = col.pk ? ' (PRIMARY KEY)' : '';
            console.log(`  ${col.name}: ${col.type} ${nullable}${pk}`);
        });
        console.log('');
    }

    // View users
    async showUsers() {
        console.log('👥 Users:');
        console.log('=========');
        
        const users = await database.all(`
            SELECT id, email, first_name, last_name, user_type, 
                   created_at, last_login, is_active 
            FROM users 
            ORDER BY created_at DESC
        `);
        
        if (users.length === 0) {
            console.log('No users found.');
            return;
        }
        
        console.table(users);
        console.log('');
    }

    // View venues
    async showVenues() {
        console.log('🏢 Venues:');
        console.log('==========');
        
        const venues = await database.all(`
            SELECT v.id, v.name, v.type, v.location, v.price, v.discount,
                   u.first_name || ' ' || u.last_name as owner_name,
                   v.created_at, v.is_active
            FROM venues v
            LEFT JOIN users u ON v.owner_id = u.id
            ORDER BY v.created_at DESC
        `);
        
        if (venues.length === 0) {
            console.log('No venues found.');
            return;
        }
        
        console.table(venues);
        console.log('');
    }

    // View sessions
    async showSessions() {
        console.log('🔐 Active Sessions:');
        console.log('==================');
        
        const sessions = await database.all(`
            SELECT s.token, u.email, u.first_name, u.last_name,
                   s.created_at, s.expires_at, s.is_active
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.is_active = 1 AND s.expires_at > datetime('now')
            ORDER BY s.created_at DESC
        `);
        
        if (sessions.length === 0) {
            console.log('No active sessions found.');
            return;
        }
        
        sessions.forEach(session => {
            console.log(`👤 ${session.email} (${session.first_name} ${session.last_name})`);
            console.log(`   Token: ${session.token.substring(0, 20)}...`);
            console.log(`   Created: ${session.created_at}`);
            console.log(`   Expires: ${session.expires_at}`);
            console.log('');
        });
    }

    // View analytics
    async showAnalytics() {
        console.log('📈 Venue Analytics:');
        console.log('==================');
        
        const analytics = await database.all(`
            SELECT va.venue_id, v.name as venue_name,
                   SUM(va.view_count) as total_views,
                   SUM(va.booking_requests) as total_bookings,
                   AVG(va.customer_ratings) as avg_rating,
                   SUM(va.revenue_generated) as total_revenue
            FROM venue_analytics va
            JOIN venues v ON va.venue_id = v.id
            GROUP BY va.venue_id, v.name
            ORDER BY total_views DESC
        `);
        
        if (analytics.length === 0) {
            console.log('No analytics data found.');
            return;
        }
        
        console.table(analytics);
        console.log('');
    }

    // View recent activity
    async showActivity(limit = 20) {
        console.log(`🔄 Recent Activity (Last ${limit}):`)
        console.log('===============================');
        
        const activities = await database.all(`
            SELECT ua.action, ua.created_at,
                   u.email, u.first_name, u.last_name,
                   ua.ip_address, ua.details
            FROM user_activity ua
            LEFT JOIN users u ON ua.user_id = u.id
            ORDER BY ua.created_at DESC
            LIMIT ?
        `, [limit]);
        
        if (activities.length === 0) {
            console.log('No activity found.');
            return;
        }
        
        activities.forEach(activity => {
            const user = activity.email ? `${activity.first_name} ${activity.last_name} (${activity.email})` : 'Unknown User';
            const details = activity.details ? ` - ${activity.details}` : '';
            console.log(`${activity.created_at}: ${activity.action} by ${user}${details}`);
        });
        console.log('');
    }

    // Database statistics
    async showStats() {
        console.log('📊 Database Statistics:');
        console.log('======================');
        
        const stats = await database.getStats();
        
        console.log(`👥 Total Users: ${stats.users.count}`);
        console.log(`🏢 Total Venues: ${stats.venues.count}`);
        console.log(`🔐 Active Sessions: ${stats.sessions.count}`);
        console.log(`📈 Analytics Records: ${stats.analytics.count}`);
        
        // Additional stats
        const userTypes = await database.all(`
            SELECT user_type, COUNT(*) as count 
            FROM users 
            GROUP BY user_type
        `);
        
        console.log('\nUser Types:');
        userTypes.forEach(type => {
            console.log(`  ${type.user_type}: ${type.count}`);
        });
        
        const venueTypes = await database.all(`
            SELECT type, COUNT(*) as count 
            FROM venues 
            WHERE is_active = 1
            GROUP BY type 
            ORDER BY count DESC 
            LIMIT 5
        `);
        
        console.log('\nTop Venue Types:');
        venueTypes.forEach(type => {
            console.log(`  ${type.type}: ${type.count}`);
        });
        console.log('');
    }

    // Custom query
    async runQuery(sql) {
        console.log(`🔍 Custom Query: ${sql}`);
        console.log('================================');
        
        try {
            const results = await database.all(sql);
            if (results.length === 0) {
                console.log('No results found.');
            } else {
                console.table(results);
            }
        } catch (error) {
            console.error('Query error:', error.message);
        }
        console.log('');
    }

    // Full database overview
    async showOverview() {
        console.log('🗄️  VenueSpot Database Overview');
        console.log('==============================\n');
        
        await this.showStats();
        await this.showTables();
        await this.showUsers();
        await this.showVenues();
        await this.showSessions();
        await this.showActivity(10);
    }
}

// Command line interface
async function main() {
    const reader = new DatabaseReader();
    const command = process.argv[2];
    const arg = process.argv[3];

    try {
        switch (command) {
            case 'overview':
                await reader.showOverview();
                break;
            case 'tables':
                await reader.showTables();
                break;
            case 'users':
                await reader.showUsers();
                break;
            case 'venues':
                await reader.showVenues();
                break;
            case 'sessions':
                await reader.showSessions();
                break;
            case 'analytics':
                await reader.showAnalytics();
                break;
            case 'activity':
                const limit = arg ? parseInt(arg) : 20;
                await reader.showActivity(limit);
                break;
            case 'stats':
                await reader.showStats();
                break;
            case 'describe':
                if (!arg) {
                    console.error('Please specify table name: node database-reader.js describe users');
                    process.exit(1);
                }
                await reader.describeTable(arg);
                break;
            case 'query':
                if (!arg) {
                    console.error('Please specify SQL query: node database-reader.js query "SELECT * FROM users"');
                    process.exit(1);
                }
                await reader.runQuery(arg);
                break;
            default:
                console.log('📚 VenueSpot Database Reader');
                console.log('===========================');
                console.log('');
                console.log('Usage:');
                console.log('  node database-reader.js [command] [options]');
                console.log('');
                console.log('Commands:');
                console.log('  overview                    - Full database overview');
                console.log('  tables                      - List all tables');
                console.log('  users                       - Show all users');
                console.log('  venues                      - Show all venues');
                console.log('  sessions                    - Show active sessions');
                console.log('  analytics                   - Show venue analytics');
                console.log('  activity [limit]            - Show recent activity (default: 20)');
                console.log('  stats                       - Show database statistics');
                console.log('  describe <table>            - Show table structure');
                console.log('  query "<sql>"               - Run custom SQL query');
                console.log('');
                console.log('Examples:');
                console.log('  node database-reader.js overview');
                console.log('  node database-reader.js users');
                console.log('  node database-reader.js describe venues');
                console.log('  node database-reader.js query "SELECT * FROM users WHERE user_type = \'admin\'"');
                console.log('  node database-reader.js activity 50');
                break;
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { DatabaseReader };