const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// 1. Create User
app.post('/api/users', (req, res) => {
    const { name, tier, year, goal, focus, confidence, whyFocus, joinedAt } = req.body;
    const sql = `INSERT INTO users (name, tier, year, goal, focus, confidence, why_focus, joined_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, tier, year, goal, focus, confidence, whyFocus, joinedAt], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// 2. Get User Profile
app.get('/api/users/:id', (req, res) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(row);
    });
});

// 3. Create or Update Daily Log
app.post('/api/logs', (req, res) => {
    const { userId, date, studied, task, hours, mood, doubts, regret, focus } = req.body;
    
    // Check if log exists for this user and date
    const checkSql = `SELECT id FROM logs WHERE user_id = ? AND date = ?`;
    db.get(checkSql, [userId, date], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const isStudiedInt = studied ? 1 : 0;
        
        if (row) {
            // Update existing log
            const updateSql = `UPDATE logs SET 
                                studied = ?, task = ?, hours = ?, mood = ?, doubts = ?, regret = ?, focus = ?
                               WHERE id = ?`;
            db.run(updateSql, [isStudiedInt, task, hours, mood, doubts, regret, focus, row.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Log updated', id: row.id });
            });
        } else {
            // Create new log
            const insertSql = `INSERT INTO logs (user_id, date, studied, task, hours, mood, doubts, regret, focus)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(insertSql, [userId, date, isStudiedInt, task, hours, mood, doubts, regret, focus], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Log created', id: this.lastID });
            });
        }
    });
});

// 4. Get All Logs for a User
app.get('/api/logs/:userId', (req, res) => {
    const sql = `SELECT * FROM logs WHERE user_id = ? ORDER BY date ASC`;
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // convert studied back to boolean
        const formattedRows = rows.map(r => ({
            ...r,
            studied: r.studied === 1
        }));
        res.json(formattedRows);
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
