const Pool = require('pg').Pool;

// Note: Update this password to match your PostgreSQL installation
// Common defaults: 'postgres', 'password', 'admin', or empty ''
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'slz_members',
  password: 'postgres', // Updated to try most common default
  port: 5432,
});
module.exports = pool;