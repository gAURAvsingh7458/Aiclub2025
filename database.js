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
                joined_at TEXT,
                username TEXT UNIQUE,
                password_hash TEXT,
                googleId TEXT UNIQUE
            )`);

            // Safe migration for existing DBs
            const addCol = (table, col, def) => {
                db.run(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`, err => {
                    if (err && !err.message.includes('duplicate column name')) console.error('Migration error:', err.message);
                });
            };
            addCol('users', 'username', 'TEXT');
            addCol('users', 'password_hash', 'TEXT');
            addCol('users', 'googleId', 'TEXT');
            addCol('users', 'email', 'TEXT');
            addCol('users', 'picture', 'TEXT');
            addCol('users', 'bio', 'TEXT');
            addCol('users', 'is_online', 'INTEGER DEFAULT 0');
            db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)');
            db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_googleId ON users(googleId)');

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
