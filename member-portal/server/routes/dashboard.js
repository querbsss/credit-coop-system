const router = require('express').Router();
const pool = require('../db_members');
const authorization = require('../middleware/authorization');

router.get('/', authorization, authorization, async (req, res) => {
    try {
        // Get user info
    const userResult = await pool.query("SELECT user_id, user_name, user_email, member_number FROM member_users WHERE user_id = $1", [req.user]);
    const user = userResult.rows[0];

        if (!user) {
            console.log('No user found for user_id:', req.user);
            return res.status(404).json({ error: 'User not found' });
        }

        // Debug: print member_number
        console.log('Queried member_number:', user.member_number);

        // Get active loan for this member
        const loanResult = await pool.query(
            `SELECT loan_amount as amount, loan_duration as duration_months, review_status, application_id, monthly_payment
             FROM loan_applications
             WHERE user_id = $1 AND review_status = 'approved'
             ORDER BY submitted_at DESC LIMIT 1`,
            [req.user]
        );
        // Debug: print loan query result
        console.log('Loan query result:', loanResult.rows);
        user.loan = loanResult.rows[0] || null;

        res.json(user);
    } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;