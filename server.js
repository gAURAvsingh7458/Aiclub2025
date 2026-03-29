const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const cron = require('node-cron');

// Mock AI Integration fallback for Market Trends
let cachedMarketTrends = [
    { title: "Generative AI specifically in local environments", description: "Huge spike in Edge AI and running models natively on specialized AI silicon locally." },
    { title: "Cybersecurity & Zero Trust Architecture", description: "Ransomware threats drive immense hiring in Indian IT specifically centering around strict network segmentation." },
    { title: "Next.js & Server Components", description: "Frontend ecosystems shifting heavily towards edge compute and server-side rendering over standard SPAs." }
];

async function fetchMarketTrends() {
    console.log("Cron [0 0 * * *]: Fetching new AI market insights...");
    // Ideally executes API call to GenAI or OpenAI SDK here returning parsed JSON array.
    // e.g., const response = await genAiInstance.generateContent({ prompt: "Top 3 trending tech for CSE" });
    // cachedMarketTrends = JSON.parse(response.text);
}

// Run daily at midnight
cron.schedule('0 0 * * *', () => {
    fetchMarketTrends();
});

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

// 2b. Upgrade User Tier
app.put('/api/users/:id/upgrade', (req, res) => {
    const sql = `UPDATE users SET tier = 'Pro' WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User upgraded successfully to Pro', id: req.params.id });
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

// 5. Get Global Leaderboard
app.get('/api/leaderboard', (req, res) => {
    const sql = `
        SELECT users.name, SUM(logs.hours) as total_hours
        FROM users
        JOIN logs ON users.id = logs.user_id
        WHERE logs.studied = 1
        GROUP BY users.id
        ORDER BY total_hours DESC
        LIMIT 10
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 6. Get Mood Stats for a User
app.get('/api/mood-stats/:userId', (req, res) => {
    const sql = `
        SELECT mood, AVG(hours) as avg_hours
        FROM logs
        WHERE user_id = ? AND studied = 1 AND mood IS NOT NULL
        GROUP BY mood
        ORDER BY avg_hours DESC
    `;
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Market Update endpoint
app.get('/api/market-updates', (req, res) => {
    res.json(cachedMarketTrends);
});

// 8. Community Activity Feed
app.get('/api/community-feed', (req, res) => {
    const sql = `
        SELECT users.year, logs.task, logs.date
        FROM users
        JOIN logs ON users.id = logs.user_id
        WHERE logs.studied = 1 AND logs.task IS NOT NULL AND logs.task != ''
        ORDER BY logs.date DESC
        LIMIT 15
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 7. Search Logs for a User
app.get('/api/logs/search/:userId', (req, res) => {
    const searchTerm = req.query.query || '';
    const sql = `
        SELECT * FROM logs 
        WHERE user_id = ? 
        AND (task LIKE ? OR doubts LIKE ?)
        ORDER BY date DESC
    `;
    const likeTerm = `%${searchTerm}%`;
    
    db.all(sql, [req.params.userId, likeTerm, likeTerm], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const formattedRows = rows.map(r => ({ ...r, studied: r.studied === 1 }));
        res.json(formattedRows);
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
