const { Client } = require('pg');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Connection details
const PG_USER = 'postgres';
const PG_HOST = 'localhost';
const PG_PORT = 5432;
const DB_NAME = 'slz_members';

// Try common default passwords first, then prompt if needed
const COMMON_PASSWORDS = ['postgres', 'password', 'admin', '123456', ''];

async function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Enter PostgreSQL postgres user password: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function testConnection(password) {
  const client = new Client({
    user: PG_USER,
    password: password,
    host: PG_HOST,
    port: PG_PORT,
    database: 'postgres',
  });
  
  try {
    await client.connect();
    await client.end();
    return true;
  } catch (err) {
    return false;
  }
}

async function findWorkingPassword() {
  console.log('Testing common PostgreSQL passwords...');
  
  for (const password of COMMON_PASSWORDS) {
    if (await testConnection(password)) {
      console.log(`Connected with password: "${password || '(empty)'}"`);
      return password;
    }
  }
  
  console.log('Common passwords failed. Please enter password manually.');
  return await promptPassword();
}

async function ensureDatabase(password) {
  const client = new Client({
    user: PG_USER,
    password: password,
    host: PG_HOST,
    port: PG_PORT,
    database: 'postgres',
  });
  await client.connect();
  try {
    const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
    if (rows.length === 0) {
      console.log(`Creating database ${DB_NAME}...`);
      await client.query(`CREATE DATABASE ${DB_NAME}`);
    } else {
      console.log(`Database ${DB_NAME} already exists.`);
    }
  } finally {
    await client.end();
  }
}

async function ensureSchema(password) {
  const client = new Client({
    user: PG_USER,
    password: password,
    host: PG_HOST,
    port: PG_PORT,
    database: DB_NAME,
  });
  await client.connect();
  try {
    // Create users table without requiring uuid extensions
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) UNIQUE NOT NULL,
        user_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    console.log('Ensured users table exists.');

    // Seed a demo user if not exists
    const email = 'member@creditcoop.com';
    const name = 'Demo Member';
    const passwordPlain = 'password123';
    const existing = await client.query('SELECT 1 FROM users WHERE user_email = $1', [email]);
    let demoUserId;
    if (existing.rowCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(passwordPlain, salt);
      const ins = await client.query(
        'INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING user_id',
        [name, email, hash]
      );
      demoUserId = ins.rows[0].user_id;
      console.log(`Seeded demo user: ${email} / ${passwordPlain}`);
    } else {
      console.log('Demo user already exists.');
      const u = await client.query('SELECT user_id FROM users WHERE user_email = $1', [email]);
      demoUserId = u.rows[0].user_id;
    }

    // Create accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('savings','checking')),
        account_number VARCHAR(32) NOT NULL,
        balance NUMERIC(14,2) NOT NULL DEFAULT 0
      )`);
    console.log('Ensured accounts table exists.');

    // Create loans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        current_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
        next_payment DATE
      )`);
    console.log('Ensured loans table exists.');

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        account VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('credit','debit','transfer')),
        description VARCHAR(255) NOT NULL,
        amount NUMERIC(14,2) NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
    console.log('Ensured transactions table exists.');

    // Seed accounts for demo user if none exist
    const accCheck = await client.query('SELECT 1 FROM accounts WHERE user_id = $1 LIMIT 1', [demoUserId]);
    if (accCheck.rowCount === 0) {
      await client.query(
        `INSERT INTO accounts (user_id, type, account_number, balance) VALUES
         ($1, 'savings', 'SV-001-2025', 150000.00),
         ($1, 'checking', 'CK-001-2025', 42000.50)`,
        [demoUserId]
      );
      console.log('Seeded demo accounts.');
    }

    // Seed a loan for demo user if none exist
    const loanCheck = await client.query('SELECT 1 FROM loans WHERE user_id = $1 LIMIT 1', [demoUserId]);
    if (loanCheck.rowCount === 0) {
      const next = new Date();
      next.setDate(next.getDate() + 14);
      await client.query(
        'INSERT INTO loans (user_id, type, current_balance, next_payment) VALUES ($1, $2, $3, $4)',
        [demoUserId, 'Auto Loan', 325000.00, next]
      );
      console.log('Seeded demo loan.');
    }

    // Seed transactions for demo user if none exist
    const txCheck = await client.query('SELECT 1 FROM transactions WHERE user_id = $1 LIMIT 1', [demoUserId]);
    if (txCheck.rowCount === 0) {
      await client.query(
        `INSERT INTO transactions (user_id, account, type, description, amount, date) VALUES
         ($1, 'Savings', 'credit', 'Salary Credit', 45000.00, NOW() - INTERVAL '2 days'),
         ($1, 'Savings', 'debit', 'ATM Withdrawal', -3000.00, NOW() - INTERVAL '1 days'),
         ($1, 'Checking', 'transfer', 'Transfer to Savings', -5000.00, NOW() - INTERVAL '20 hours'),
         ($1, 'Checking', 'debit', 'Bill Payment - Electric', -2200.50, NOW() - INTERVAL '5 hours')`,
        [demoUserId]
      );
      console.log('Seeded demo transactions.');
    }
  } finally {
    await client.end();
  }
}

(async () => {
  try {
    const password = await findWorkingPassword();
    await ensureDatabase(password);
    await ensureSchema(password);
    console.log('Member DB setup completed successfully.');
    console.log('Demo user: member@creditcoop.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('DB setup failed:', err && (err.stack || err.message || err));
    process.exit(1);
  }
})();
