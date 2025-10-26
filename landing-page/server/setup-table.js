const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection using the same credentials as the server
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'slz_pass123',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'slz_coop'
});

async function createTable() {
  try {
    // Read the SQL file
    const sqlFile = fs.readFileSync(path.join(__dirname, 'membership_applications.sql'), 'utf8');
    
    // Execute the SQL
    await pool.query(sqlFile);
    
    console.log('✅ membership_applications table created successfully!');
    
    // Test if table exists
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'membership_applications'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful - membership_applications table exists');
    } else {
      console.log('❌ Table verification failed - table not found');
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    await pool.end();
  }
}

createTable();