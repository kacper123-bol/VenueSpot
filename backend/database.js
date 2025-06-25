const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'venuespot.db');

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to VenueSpot SQLite database at:', dbPath);
                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON');
                    resolve();
                }
            });
        });
    }

    // Promisify database methods
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('Database run error:', err.message);
                    console.error('SQL:', sql);
                    console.error('Params:', params);
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('Database get error:', err.message);
                    console.error('SQL:', sql);
                    console.error('Params:', params);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Database all error:', err.message);
                    console.error('SQL:', sql);
                    console.error('Params:', params);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Execute multiple SQL statements (for migrations)
    exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) {
                    console.error('Database exec error:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Transaction support
    async transaction(callback) {
        await this.run('BEGIN TRANSACTION');
        try {
            const result = await callback(this);
            await this.run('COMMIT');
            return result;
        } catch (error) {
            await this.run('ROLLBACK');
            throw error;
        }
    }

    // Close database connection
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed.');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // Get database statistics
    async getStats() {
        const stats = {
            users: await this.get('SELECT COUNT(*) as count FROM users'),
            venues: await this.get('SELECT COUNT(*) as count FROM venues'),
            sessions: await this.get('SELECT COUNT(*) as count FROM sessions WHERE is_active = 1'),
            analytics: await this.get('SELECT COUNT(*) as count FROM venue_analytics')
        };
        return stats;
    }
}

// Create single instance
const database = new Database();

module.exports = database;