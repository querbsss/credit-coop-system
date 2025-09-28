const router = require('express').Router();
const pool = require('../db_members');
const authorization = require('../middleware/authorization');

// Basic identity endpoint (kept for backward compatibility)
router.get('/', authorization, async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT user_id, user_name, user_email FROM users WHERE user_id = $1',
            [req.user]
        );
        res.json(user.rows[0] || {});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Dashboard summary endpoint
router.get('/summary', authorization, async (req, res) => {
    try {
        const userId = req.user;

        // 1) Core user
        const userRes = await pool.query(
            'SELECT user_id, user_name, user_email FROM users WHERE user_id = $1',
            [userId]
        );
        const u = userRes.rows[0];
        if (!u) return res.status(404).json({ error: 'User not found' });

        // Split name to first/last (simple heuristic)
        const parts = (u.user_name || '').split(' ');
        const firstName = parts[0] || 'Member';
        const lastName = parts.slice(1).join(' ') || '';

        // 2) Accounts
        const accRes = await pool.query(
            'SELECT type, account_number, balance FROM accounts WHERE user_id = $1',
            [userId]
        );
        const accounts = { savings: null, checking: null };
        for (const row of accRes.rows) {
            if (row.type === 'savings') {
                accounts.savings = {
                    accountNumber: row.account_number,
                    balance: Number(row.balance)
                };
            } else if (row.type === 'checking') {
                accounts.checking = {
                    accountNumber: row.account_number,
                    balance: Number(row.balance)
                };
            }
        }

        // 3) Loans
        const loanRes = await pool.query(
            'SELECT id, type, current_balance, next_payment FROM loans WHERE user_id = $1 ORDER BY id',
            [userId]
        );
        const loans = loanRes.rows.map(l => ({
            id: l.id,
            type: l.type,
            currentBalance: Number(l.current_balance),
            nextPayment: l.next_payment
        }));

        // 4) Recent transactions
        const txRes = await pool.query(
            `SELECT id, account, type, description, amount, date
             FROM transactions WHERE user_id = $1
             ORDER BY date DESC, id DESC
             LIMIT 10`,
            [userId]
        );
        const recentTransactions = txRes.rows.map(t => ({
            id: t.id,
            account: t.account,
            type: t.type,
            description: t.description,
            amount: Number(t.amount),
            date: t.date
        }));

        const payload = {
            authenticated: true,
            firstName,
            lastName,
            email: u.user_email,
            accounts,
            loans,
            recentTransactions
        };

        res.json({ user: payload });
    } catch (err) {
        console.error('Dashboard summary error:', err && (err.stack || err.message || err));
        res.status(500).send('Server Error');
    }
});

module.exports = router;