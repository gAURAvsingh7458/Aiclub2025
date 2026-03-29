const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'pathpilot.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                tier TEXT,
                year TEXT,
                goal TEXT,
                focus TEXT,
                confidence INTEGER,
                why_focus TEXT,
                joined_at TEXT
            )`);

            // Logs table
            db.run(`CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date TEXT,
                studied BOOLEAN,
                task TEXT,
                hours REAL,
                mood TEXT,
                doubts TEXT,
                regret INTEGER,
                focus TEXT
            )`);
        });
    }
});

module.exports = db;
