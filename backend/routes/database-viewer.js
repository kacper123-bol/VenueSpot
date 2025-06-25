const express = require('express');
const database = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/db/tables - List all tables
router.get('/tables', requireAuth, requireAdmin, async (req, res) => {
    try {
        const tables = await database.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);
        
        const tablesWithCounts = [];
        for (const table of tables) {
            const count = await database.get(`SELECT COUNT(*) as count FROM ${table.name}`);
            tablesWithCounts.push({
                name: table.name,
                count: count.count
            });
        }
        
        res.json({ tables: tablesWithCounts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/db/table/:name - Get table data
router.get('/table/:name', requireAuth, requireAdmin, async (req, res) => {
    try {
        const tableName = req.params.name;
        const { limit = 100, offset = 0 } = req.query;
        
        // Validate table name to prevent SQL injection
        const validTables = await database.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `);
        
        if (!validTables.find(t => t.name === tableName)) {
            return res.status(404).json({ error: 'Table not found' });
        }
        
        // Get table structure
        const columns = await database.all(`PRAGMA table_info(${tableName})`);
        
        // Get table data
        const data = await database.all(`
            SELECT * FROM ${tableName} 
            ORDER BY 1 
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        
        // Get total count
        const total = await database.get(`SELECT COUNT(*) as count FROM ${tableName}`);
        
        res.json({
            table: tableName,
            columns,
            data,
            pagination: {
                total: total.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/db/query - Execute custom query
router.post('/query', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { sql } = req.body;
        
        if (!sql) {
            return res.status(400).json({ error: 'SQL query is required' });
        }
        
        // Only allow SELECT queries for safety
        if (!sql.trim().toLowerCase().startsWith('select')) {
            return res.status(400).json({ error: 'Only SELECT queries are allowed' });
        }
        
        const results = await database.all(sql);
        
        res.json({
            query: sql,
            results,
            count: results.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/db/export - Export database
router.get('/export', requireAuth, requireAdmin, async (req, res) => {
    try {
        const tables = ['users', 'venues', 'sessions', 'venue_analytics', 'user_activity', 'settings'];
        const exportData = {
            exportedAt: new Date().toISOString(),
            exportedBy: req.user.email,
            data: {}
        };
        
        for (const tableName of tables) {
            try {
                const data = await database.all(`SELECT * FROM ${tableName}`);
                exportData.data[tableName] = data;
            } catch (error) {
                console.warn(`Failed to export table ${tableName}:`, error.message);
                exportData.data[tableName] = [];
            }
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="venuespot-export.json"');
        res.json(exportData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;