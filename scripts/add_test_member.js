const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Database configuration from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addTestMember() {
  try {
    // Hash the password 'testpass123'
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('testpass123', saltRounds);
    
    // Insert test member
    const result = await pool.query(`
      INSERT INTO member_users (user_name, user_email, user_password, member_number, is_active) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [
      'Test Member User',
      'testmember@example.com', 
      hashedPassword,
      'TEST001',
      true
    ]);
    
    console.log('Test member created successfully:');
    console.log('Member Number: TEST001');
    console.log('Email: testmember@example.com');
    console.log('Password: testpass123');
    console.log('User ID:', result.rows[0].user_id);
    
    await pool.end();
  } catch (error) {
    console.error('Error creating test member:', error);
    process.exit(1);
  }
}

addTestMember();