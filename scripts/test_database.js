// Database connection test and user creation script
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test if member_users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'member_users'
      );
    `);
    
    console.log('📊 member_users table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Check existing users
      const users = await client.query('SELECT member_number, user_email, is_active FROM member_users ORDER BY member_number');
      console.log('👥 Existing users:', users.rows);
      
      // Check for specific test users
      const testUsers = await client.query(`
        SELECT member_number, user_email, is_active 
        FROM member_users 
        WHERE member_number IN ('MEM001', 'TEST123')
      `);
      console.log('🧪 Test users found:', testUsers.rows);
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function createTestUsers() {
  try {
    console.log('👤 Creating test users...');
    
    const client = await pool.connect();
    
    // Create table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS member_users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL UNIQUE,
        user_password VARCHAR(255) NOT NULL,
        member_number VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);
    
    // Hash password: testpass123
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    console.log('🔐 Password hashed successfully');
    
    // Insert test users
    const insertResult = await client.query(`
      INSERT INTO member_users (user_name, user_email, user_password, member_number, is_active) 
      VALUES 
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10)
      ON CONFLICT (user_email) DO NOTHING
      RETURNING member_number, user_email;
    `, [
      'Test User MEM001', 'mem001@example.com', hashedPassword, 'MEM001', true,
      'Test User TEST123', 'test123@example.com', hashedPassword, 'TEST123', true
    ]);
    
    console.log('✅ Test users created/updated:', insertResult.rows);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Failed to create test users:', error.message);
  }
}

async function testLogin() {
  try {
    console.log('🔑 Testing login logic...');
    
    const client = await pool.connect();
    
    // Test the same query as the login endpoint
    const user = await client.query(
      "SELECT * FROM member_users WHERE member_number = $1 AND is_active = true", 
      ['MEM001']
    );
    
    if (user.rows.length === 0) {
      console.log('❌ User MEM001 not found or inactive');
    } else {
      console.log('✅ User MEM001 found:', {
        member_number: user.rows[0].member_number,
        user_email: user.rows[0].user_email,
        is_active: user.rows[0].is_active
      });
      
      // Test password verification
      const validPassword = await bcrypt.compare('testpass123', user.rows[0].user_password);
      console.log('🔐 Password verification:', validPassword ? '✅ Valid' : '❌ Invalid');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting database diagnostic...\n');
  
  await testDatabaseConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await createTestUsers();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testLogin();
  
  await pool.end();
  console.log('\n✅ Database diagnostic complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testDatabaseConnection, createTestUsers, testLogin };