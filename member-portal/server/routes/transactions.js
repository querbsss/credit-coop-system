const router = require('express').Router();
const pool = require('../db_members');
const authorization = require('../middleware/authorization');

function normalizeAccount(input) {
  const v = String(input || '').toLowerCase();
  if (v.startsWith('sav')) return 'savings';
  if (v.startsWith('chk') || v.startsWith('check')) return 'checking';
  return v;
}

// List recent transactions
router.get('/', authorization, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200);
    const { rows } = await pool.query(
      `SELECT id, account, type, description, amount, date
       FROM transactions WHERE user_id = $1
       ORDER BY date DESC, id DESC
       LIMIT ${limit}`,
      [req.user]
    );
    res.json({ transactions: rows });
  } catch (err) {
    console.error('List transactions error:', err);
    res.status(500).send('Server Error');
  }
});

// Create a transaction (credit/debit)
router.post('/', authorization, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user;
    let { account, type, description, amount } = req.body;
    if (!account || !type || !description || amount == null) {
      return res.status(400).json({ error: 'account, type, description, amount are required' });
    }
    account = normalizeAccount(account);
    type = String(type).toLowerCase();
    amount = Number(amount);
    if (!['credit', 'debit'].includes(type) || !['savings', 'checking'].includes(account) || !isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transaction payload' });
    }

    await client.query('BEGIN');

    // Ensure account row exists for this user
    const accRes = await client.query(
      'SELECT id, balance FROM accounts WHERE user_id = $1 AND type = $2 FOR UPDATE',
      [userId, account]
    );
    if (accRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Account not found for user' });
    }
    const acc = accRes.rows[0];

    const signedAmount = type === 'credit' ? amount : -amount;

    // Insert transaction
    await client.query(
      'INSERT INTO transactions (user_id, account, type, description, amount, date) VALUES ($1,$2,$3,$4,$5,NOW())',
      [userId, account === 'savings' ? 'Savings' : 'Checking', type, description, signedAmount]
    );

    // Update account balance
    const newBal = Number(acc.balance) + signedAmount;
    await client.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newBal, acc.id]);

    await client.query('COMMIT');
    res.json({ success: true, balance: newBal });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Create transaction error:', err);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

module.exports = router;
