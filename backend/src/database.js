const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fusiondocs',
    ssl: { rejectUnauthorized: false } 
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL Database');
});

const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Users table
        await client.query(`CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'staff'
        )`);

        // Company Settings table
        await client.query(`CREATE TABLE IF NOT EXISTS CompanySettings (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            gstin VARCHAR(50),
            bank_details TEXT,
            terms TEXT,
            quote_prefix VARCHAR(10) DEFAULT 'QT',
            invoice_prefix VARCHAR(10) DEFAULT 'INV',
            challan_prefix VARCHAR(10) DEFAULT 'DC'
        )`);

        // Customers table
        await client.query(`CREATE TABLE IF NOT EXISTS Customers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            billing_address TEXT,
            shipping_address TEXT,
            gstin VARCHAR(50),
            phone VARCHAR(50),
            email VARCHAR(255)
        )`);

        // Documents table
        await client.query(`CREATE TABLE IF NOT EXISTS Documents (
            id SERIAL PRIMARY KEY,
            document_number VARCHAR(100) UNIQUE NOT NULL,
            type VARCHAR(50) NOT NULL,
            date VARCHAR(50) NOT NULL,
            customer_id INTEGER REFERENCES Customers(id),
            subtotal DECIMAL(10,2) DEFAULT 0,
            total_gst DECIMAL(10,2) DEFAULT 0,
            grand_total DECIMAL(10,2) DEFAULT 0,
            status VARCHAR(50) DEFAULT 'draft',
            created_by INTEGER REFERENCES Users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Document Items table
        await client.query(`CREATE TABLE IF NOT EXISTS DocumentItems (
            id SERIAL PRIMARY KEY,
            document_id INTEGER REFERENCES Documents(id),
            item_name VARCHAR(255) NOT NULL,
            hsn VARCHAR(50),
            qty INTEGER DEFAULT 1,
            unit VARCHAR(50),
            unit_price DECIMAL(10,2) DEFAULT 0,
            gst_percent DECIMAL(5,2) DEFAULT 0,
            line_total DECIMAL(10,2) DEFAULT 0
        )`);

        // Seed default admin user
        const res = await client.query("SELECT COUNT(*) FROM Users");
        if (parseInt(res.rows[0].count) === 0) {
            const bcrypt = require('bcrypt');
            const hash = await bcrypt.hash('admin123', 10);
            await client.query("INSERT INTO Users (username, password_hash, role) VALUES ('admin', $1, 'admin')", [hash]);
            console.log('Default admin user created (admin / admin123)');
        }

        await client.query('COMMIT');
        console.log('Database tables verified.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error initializing database schema', e);
    } finally {
        client.release();
    }
};

initializeDatabase();

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
