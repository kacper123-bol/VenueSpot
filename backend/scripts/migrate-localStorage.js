const database = require('../database');
const { hashPassword } = require('../middleware/auth');

// Migration script to import localStorage data into SQLite database
class LocalStorageMigration {
    constructor() {
        this.migrationLog = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, type, message };
        this.migrationLog.push(logEntry);
        
        const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`[${timestamp}] ${emoji} ${message}`);
    }

    async migrateUsers(users) {
        this.log('Starting user migration...');
        let migrated = 0;
        let skipped = 0;
        let errors = 0;

        for (const user of users) {
            try {
                // Check if user already exists
                const existing = await database.get('SELECT id FROM users WHERE email = ?', [user.email]);
                if (existing) {
                    this.log(`User ${user.email} already exists, skipping`, 'warning');
                    skipped++;
                    continue;
                }

                // Hash the password (localStorage stored plain text)
                const passwordHash = await hashPassword(user.password);

                // Insert user
                await database.run(`
                    INSERT INTO users (email, password_hash, first_name, last_name, user_type, created_at, last_login, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    user.email,
                    passwordHash,
                    user.firstName,
                    user.lastName,
                    user.userType || 'customer',
                    user.createdAt || new Date().toISOString(),
                    user.lastLogin,
                    user.isActive !== false ? 1 : 0
                ]);

                this.log(`Migrated user: ${user.email}`, 'success');
                migrated++;

            } catch (error) {
                this.log(`Failed to migrate user ${user.email}: ${error.message}`, 'error');
                errors++;
            }
        }

        this.log(`User migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
        return { migrated, skipped, errors };
    }

    async migrateVenues(venues) {
        this.log('Starting venue migration...');
        let migrated = 0;
        let skipped = 0;
        let errors = 0;

        for (const venue of venues) {
            try {
                // Check if venue already exists
                const existing = await database.get('SELECT id FROM venues WHERE name = ? AND location = ?', [venue.name, venue.location]);
                if (existing) {
                    this.log(`Venue ${venue.name} at ${venue.location} already exists, skipping`, 'warning');
                    skipped++;
                    continue;
                }

                // Find owner by email if provided
                let ownerId = null;
                if (venue.ownerEmail) {
                    const owner = await database.get('SELECT id FROM users WHERE email = ?', [venue.ownerEmail]);
                    if (owner) {
                        ownerId = owner.id;
                    }
                }

                // Insert venue
                await database.run(`
                    INSERT INTO venues (
                        name, type, location, price, discount, availability,
                        description, detailed_description, image_url,
                        contact_phone, contact_email, contact_address,
                        owner_id, is_active, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    venue.name,
                    venue.type,
                    venue.location,
                    venue.price,
                    venue.discount,
                    venue.availability,
                    venue.description,
                    venue.detailedDescription,
                    venue.image,
                    venue.contact?.phone,
                    venue.contact?.email,
                    venue.contact?.address,
                    ownerId,
                    venue.isActive !== false ? 1 : 0,
                    venue.createdAt || new Date().toISOString(),
                    venue.updatedAt || new Date().toISOString()
                ]);

                this.log(`Migrated venue: ${venue.name}`, 'success');
                migrated++;

            } catch (error) {
                this.log(`Failed to migrate venue ${venue.name}: ${error.message}`, 'error');
                errors++;
            }
        }

        this.log(`Venue migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
        return { migrated, skipped, errors };
    }

    async migrateSettings(settings) {
        this.log('Starting settings migration...');
        let migrated = 0;

        const settingsMap = {
            'session_timeout': settings.sessionTimeout || 86400000,
            'next_user_id': settings.nextUserId || 1,
            'next_venue_id': settings.nextVenueId || 1
        };

        for (const [key, value] of Object.entries(settingsMap)) {
            try {
                await database.run(`
                    INSERT OR REPLACE INTO settings (key, value, description, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                `, [key, value.toString(), `Migrated from localStorage`]);

                this.log(`Migrated setting: ${key}`, 'success');
                migrated++;

            } catch (error) {
                this.log(`Failed to migrate setting ${key}: ${error.message}`, 'error');
            }
        }

        this.log(`Settings migration complete: ${migrated} migrated`);
        return { migrated };
    }

    async performMigration(localStorageData) {
        this.log('🚀 Starting localStorage to SQLite migration...');
        
        const results = {
            users: { migrated: 0, skipped: 0, errors: 0 },
            venues: { migrated: 0, skipped: 0, errors: 0 },
            settings: { migrated: 0 }
        };

        try {
            // Start transaction
            await database.run('BEGIN TRANSACTION');

            // Migrate users
            if (localStorageData.users && Array.isArray(localStorageData.users)) {
                results.users = await this.migrateUsers(localStorageData.users);
            }

            // Migrate venues
            if (localStorageData.venues && Array.isArray(localStorageData.venues)) {
                results.venues = await this.migrateVenues(localStorageData.venues);
            }

            // Migrate settings
            if (localStorageData.settings && typeof localStorageData.settings === 'object') {
                results.settings = await this.migrateSettings(localStorageData.settings);
            }

            // Commit transaction
            await database.run('COMMIT');

            this.log('✅ Migration completed successfully!', 'success');
            
            // Print summary
            console.log('\n📊 Migration Summary:');
            console.log(`👥 Users: ${results.users.migrated} migrated, ${results.users.skipped} skipped, ${results.users.errors} errors`);
            console.log(`🏢 Venues: ${results.venues.migrated} migrated, ${results.venues.skipped} skipped, ${results.venues.errors} errors`);
            console.log(`⚙️  Settings: ${results.settings.migrated} migrated`);

            return { success: true, results, log: this.migrationLog };

        } catch (error) {
            // Rollback transaction
            await database.run('ROLLBACK');
            this.log(`Migration failed: ${error.message}`, 'error');
            return { success: false, error: error.message, log: this.migrationLog };
        }
    }

    // Generate export script for browser console
    generateExportScript() {
        return `
// VenueSpot localStorage Export Script
// Run this in your browser's developer console on the VenueSpot site

(function() {
    const exportData = {
        users: JSON.parse(localStorage.getItem('venuespot_users') || '[]'),
        venues: JSON.parse(localStorage.getItem('venuespot_approved_venues') || '[]'),
        settings: JSON.parse(localStorage.getItem('venuespot_settings') || '{}'),
        sessions: JSON.parse(localStorage.getItem('venuespot_sessions') || '[]'),
        exportedAt: new Date().toISOString(),
        exportedFrom: window.location.origin
    };
    
    console.log('VenueSpot localStorage data:');
    console.log(JSON.stringify(exportData, null, 2));
    
    // Create downloadable file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type:'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'venuespot-localStorage-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Data exported to file: venuespot-localStorage-export.json');
    console.log('📋 Copy the JSON above and use it with the migration script');
    
    return exportData;
})();
        `.trim();
    }
}

// Example usage function
async function runMigration(localStorageDataFile) {
    const migration = new LocalStorageMigration();
    
    try {
        // Load data from file
        const fs = require('fs');
        const localStorageData = JSON.parse(fs.readFileSync(localStorageDataFile, 'utf8'));
        
        // Perform migration
        const result = await migration.performMigration(localStorageData);
        
        if (result.success) {
            console.log('\n🎉 Migration completed successfully!');
            process.exit(0);
        } else {
            console.error('\n💥 Migration failed:', result.error);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('💥 Migration script error:', error.message);
        process.exit(1);
    }
}

// Command line usage
if (require.main === module) {
    const migration = new LocalStorageMigration();
    
    if (process.argv[2] === 'generate-export-script') {
        console.log('📋 Browser Console Export Script:');
        console.log('================================');
        console.log(migration.generateExportScript());
        console.log('================================');
        console.log('\n💡 Instructions:');
        console.log('1. Open your VenueSpot site in the browser');
        console.log('2. Open Developer Tools (F12)');
        console.log('3. Go to the Console tab');
        console.log('4. Paste and run the script above');
        console.log('5. Download the generated JSON file');
        console.log('6. Run: node migrate-localStorage.js <path-to-json-file>');
        
    } else if (process.argv[2]) {
        runMigration(process.argv[2]);
        
    } else {
        console.log('📚 VenueSpot localStorage Migration Tool');
        console.log('========================================');
        console.log('');
        console.log('Usage:');
        console.log('  node migrate-localStorage.js generate-export-script');
        console.log('  node migrate-localStorage.js <path-to-localStorage-export.json>');
        console.log('');
        console.log('Examples:');
        console.log('  node migrate-localStorage.js generate-export-script');
        console.log('  node migrate-localStorage.js ./venuespot-localStorage-export.json');
        console.log('');
        console.log('Steps:');
        console.log('1. Generate export script to extract localStorage data');
        console.log('2. Run the script in your browser console');
        console.log('3. Save the exported JSON file');
        console.log('4. Run migration with the JSON file');
    }
}

module.exports = { LocalStorageMigration };