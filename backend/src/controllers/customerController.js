const db = require('../database');

const getAllCustomers = async (req, res) => {
    const { search } = req.query;
    
    try {
        if (search) {
            const query = 'SELECT * FROM Customers WHERE name ILIKE $1 OR gstin ILIKE $1 ORDER BY id DESC';
            const params = [`%${search}%`];
            const result = await db.query(query, params);
            res.json(result.rows);
        } else {
            const result = await db.query('SELECT * FROM Customers ORDER BY id DESC');
            res.json(result.rows);
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Customers WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

const createCustomer = async (req, res) => {
    const { name, billing_address, shipping_address, gstin, phone, email } = req.body;
    try {
        const result = await db.query(`INSERT INTO Customers (name, billing_address, shipping_address, gstin, phone, email) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [name, billing_address, shipping_address, gstin, phone, email]
        );
        res.status(201).json({ message: 'Customer created successfully', id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create customer' });
    }
};

const updateCustomer = async (req, res) => {
    const { name, billing_address, shipping_address, gstin, phone, email } = req.body;
    try {
        const result = await db.query(`UPDATE Customers SET name = $1, billing_address = $2, shipping_address = $3, gstin = $4, phone = $5, email = $6 WHERE id = $7`,
            [name, billing_address, shipping_address, gstin, phone, email, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const result = await db.query('DELETE FROM Customers WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete customer' });
    }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
