require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createUser() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const result = await pool.query(
      "INSERT INTO Users (username, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password_hash = $2 RETURNING username",
      ['admin@admin.co.in', hash, 'admin']
    );
    console.log(`Successfully created/updated user: ${result.rows[0].username}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

createUser();
