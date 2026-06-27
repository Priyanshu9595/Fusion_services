const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const login = async (req, res) => {
    let { username, password } = req.body;
    username = String(username || '').trim().toLowerCase();

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const result = await db.query('SELECT * FROM Users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (isMatch) {
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' });
            res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

const register = async (req, res) => {
    let { username, password } = req.body;
    username = String(username || '').trim().toLowerCase();

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Domain Validation and Role Assignment
    let assignedRole = 'staff';
    
    if (username.endsWith('@staff.co.in')) {
        assignedRole = 'staff';
    } else {
        return res.status(400).json({ error: 'Admin registration is disabled. Email must end with @staff.co.in' });
    }
    
    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await db.query('INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id', [username, hash, assignedRole]);
        res.status(201).json({ message: 'User created successfully', userId: result.rows[0].id });
    } catch (err) {
        if (err.code === '23505') { // Postgres unique violation error code
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { login, register };
