const pool = require('./db_members');

async function ensureDashboardSchema() {
  // Create minimal tables if they are missing to avoid runtime errors
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('savings','checking')),
      account_number VARCHAR(32) NOT NULL,
      balance NUMERIC(14,2) NOT NULL DEFAULT 0
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS loans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      current_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
      next_payment DATE
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      account VARCHAR(50) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('credit','debit','transfer')),
      description VARCHAR(255) NOT NULL,
      amount NUMERIC(14,2) NOT NULL,
      date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
}

module.exports = { ensureDashboardSchema };
