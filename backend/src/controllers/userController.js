const db = require('../database');
const bcrypt = require('bcrypt');

const getUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, username, role FROM Users ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

const createUser = async (req, res) => {
    let { username, password } = req.body;
    
    username = username.toLowerCase().trim();
    let assignedRole = 'staff';
    if (username.endsWith('@manager.co.in')) {
        assignedRole = 'admin';
    } else if (username.endsWith('@staff.co.in')) {
        assignedRole = 'staff';
    } else {
        return res.status(400).json({ error: 'Email must end with @manager.co.in or @staff.co.in' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await db.query('INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role', [username, hash, assignedRole]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Database error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    let { username, password } = req.body;

    username = username.toLowerCase().trim();
    let assignedRole = 'staff';
    if (username.endsWith('@manager.co.in')) {
        assignedRole = 'admin';
    } else if (username.endsWith('@staff.co.in')) {
        assignedRole = 'staff';
    } else {
        return res.status(400).json({ error: 'Email must end with @manager.co.in or @staff.co.in' });
    }

    try {
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            await db.query('UPDATE Users SET username = $1, password_hash = $2, role = $3 WHERE id = $4', [username, hash, assignedRole, id]);
        } else {
            await db.query('UPDATE Users SET username = $1, role = $2 WHERE id = $3', [username, assignedRole, id]);
        }
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Database error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    try {
        await db.query('DELETE FROM Users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
