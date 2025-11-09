const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Use the same DATABASE_URL as your Render backend
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Setting up database tables and test users...');

    // Create member_users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS member_users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) UNIQUE NOT NULL,
        user_password VARCHAR(255) NOT NULL,
        member_number VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('✅ member_users table created/verified');

    // Hash passwords
    const testPassword = await bcrypt.hash('testpass123', 10);
    const memPassword = await bcrypt.hash('password123', 10);

    // Insert test users (using UPSERT to avoid conflicts)
    await client.query(`
      INSERT INTO member_users (user_name, user_email, user_password, member_number, is_active)
      VALUES 
        ('Test User Account', 'testuser@example.com', $1, 'TEST123', true),
        ('John Querby Banawa Valencia', 'valenciaquerby@gmail.com', $2, 'MEM001', true)
      ON CONFLICT (user_email) DO UPDATE SET
        user_password = EXCLUDED.user_password,
        member_number = EXCLUDED.member_number,
        updated_at = CURRENT_TIMESTAMP
    `, [testPassword, memPassword]);
    
    console.log('✅ Test users created/updated:');
    console.log('   - TEST123 (password: testpass123)');
    console.log('   - MEM001 (password: password123)');

    // Verify users were created
    const result = await client.query('SELECT member_number, user_email, user_name, is_active FROM member_users ORDER BY member_number');
    console.log('\n📋 Current users in database:');
    result.rows.forEach(user => {
      console.log(`   ${user.member_number}: ${user.user_name} (${user.user_email}) - Active: ${user.is_active}`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nYou can now login with:');
    console.log('- Member Number: TEST123, Password: testpass123');
    console.log('- Member Number: MEM001, Password: password123');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();