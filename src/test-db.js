require('dotenv').config();
const { Pool } = require('pg');

// Log the environment variables
console.log('Environment variables:');
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_PASSWORD length:', process.env.POSTGRES_PASSWORD ? process.env.POSTGRES_PASSWORD.length : 0);

// Create a pool with explicit configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
});

// Test the connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL');
    const result = await client.query('SELECT NOW()');
    console.log('Query result:', result.rows[0]);
    client.release();
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } finally {
    pool.end();
  }
}

testConnection(); 