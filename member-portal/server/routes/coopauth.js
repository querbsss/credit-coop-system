const router = require('express').Router();
const pool = require('../db_members');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validation = require('../middleware/validation');
const authorization = require('../middleware/authorization');

router.post('/register', validation, async (req, res) => {
    try {
        // Member registration is disabled - accounts are created by IT Admin
        return res.status(403).json({ 
            message: "Member registration is disabled. Please contact your IT Administrator to create your account." 
        });
    } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/login', validation, async (req, res) => {
    try {
        // 1. Get user input - accepting both email and memberNumber
        const { email, memberNumber, password } = req.body;
        const loginField = email || memberNumber;

        // 2. Validate user input
        if (!(loginField && password)){
            return res.status(400).send("Member number/email and password are required");
        }

        // 3. Check if user exists in member_users table (check both email and member number fields)
        let user;
        if (email) {
            user = await pool.query("SELECT * FROM member_users WHERE user_email = $1 AND is_active = true", [email]);
        } else {
            // Check by member number
            user = await pool.query("SELECT * FROM member_users WHERE member_number = $1 AND is_active = true", [memberNumber]);
        }

        if (user.rows.length === 0){
            return res.status(400).send("User does not exist or account is inactive");
        }

        // 4. Check if password is correct
        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

        if (!validPassword){
            return res.status(400).send("Invalid Password");
        }

        // 5. Generate JWT token
        const token = jwtGenerator(user.rows[0].user_id);
        res.json({ token, user: user.rows[0] });
    } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/is-verify', authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get user's membership application data
router.get('/membership-data', authorization, async (req, res) => {
    try {
        const userId = req.user;
        console.log('Fetching membership data for user:', userId);
        
        // First get the member number from member_users table
        const userQuery = `SELECT member_number FROM member_users WHERE user_id = $1`;
        const userResult = await pool.query(userQuery, [userId]);
        
        if (userResult.rows.length === 0) {
            console.log('No member found for user:', userId);
            return res.status(404).json({ message: 'Member not found' });
        }
        
        const memberNumber = userResult.rows[0].member_number;
        console.log('Found member number:', memberNumber);

        // Now query membership_applications with the member number
        const query = `SELECT 
                first_name,
                last_name,
                middle_name,
                suffix,
                address,
                contact_number,
                membership_type,
                date_of_birth,
                gender,
                civil_status,
                created_at
             FROM membership_applications 
             WHERE applicants_membership_number = $1 
             ORDER BY created_at DESC 
             LIMIT 1`;
        console.log('Executing query:', query);
        console.log('With parameter:', memberNumber);

        const membershipResult = await pool.query(query, [memberNumber]);
        console.log('Query result:', membershipResult.rows);

        if (membershipResult.rows.length === 0) {
            console.log('No membership application found for member number:', memberNumber);
            return res.status(404).json({ message: 'Membership application not found' });
        }

        res.json(membershipResult.rows[0]);
    } catch (err) {
        console.error('Error fetching membership data:', err);
        console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            detail: err.detail
        });
        res.status(500).json({ 
            error: 'Server Error', 
            message: err.message,
            detail: err.detail 
        });
    }
});

// Change password endpoint
router.put('/password/update', authorization, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user;

        // Get user's current password hash
        const user = await pool.query(
            "SELECT user_password FROM member_users WHERE user_id = $1",
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.rows[0].user_password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await pool.query(
            "UPDATE member_users SET user_password = $1 WHERE user_id = $2",
            [hashedPassword, userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;