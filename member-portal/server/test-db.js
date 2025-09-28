const pool = require('./db_members');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query test passed:', result.rows[0]);
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    console.log('✅ Users table exists:', tableCheck.rows[0].exists);
    
    // Check if demo user exists
    const userCheck = await client.query('SELECT user_email FROM users WHERE user_email = $1', ['member@creditcoop.com']);
    console.log('✅ Demo user exists:', userCheck.rowCount > 0);
    
    client.release();
    console.log('✅ Connection test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

testConnection();