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

router.post('/auth/login', validation, async (req, res) => {
    try {
        console.log('Login attempt received:', { body: req.body, headers: req.headers });
        
        // 1. Get user input - accepting both email and memberNumber

        const { email, memberNumber, password } = req.body;
        const loginField = email || memberNumber;

        console.log('=== LOGIN DEBUG ===');
        console.log('Login field:', loginField, 'Password provided:', !!password);
        console.log('Raw req.body:', req.body);

        // 2. Validate user input
        if (!(loginField && password)){
            console.log('Validation failed: missing credentials');
            return res.status(400).send("Member number/email and password are required");
        }

        // 3. Check if user exists in member_users table (check both email and member number fields)
        let user;
        if (email) {
            console.log('Looking up user by email:', email);
            user = await pool.query("SELECT * FROM member_users WHERE user_email = $1 AND is_active = true", [email]);
        } else {
            console.log('Looking up user by memberNumber:', memberNumber);
            user = await pool.query("SELECT * FROM member_users WHERE member_number = $1 AND is_active = true", [memberNumber]);
        }

        console.log('User query result:', user.rows);

        if (user.rows.length === 0){
            console.log('User not found or inactive');
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

// Debug endpoint to test database connection
router.get('/debug-db', async (req, res) => {
    try {
        console.log('Testing database connection...');
        const result = await pool.query('SELECT COUNT(*) FROM member_users WHERE is_active = true');
        const userCount = result.rows[0].count;
        
        const users = await pool.query('SELECT member_number, user_name, user_email FROM member_users WHERE is_active = true ORDER BY member_number');
        
        res.json({
            success: true,
            message: 'Database connection successful',
            activeUsers: userCount,
            users: users.rows
        });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            code: err.code,
            detail: err.detail
        });
    }
});

// Debug endpoint to test password verification (no validation middleware)
router.post('/debug-password', async (req, res) => {
    try {
        const { memberNumber, password } = req.body;
        
        console.log('=== PASSWORD DEBUG ===');
        console.log('Member Number:', memberNumber);
        console.log('Password provided:', !!password);
        
        if (!memberNumber || !password) {
            return res.json({ 
                success: false, 
                message: 'Missing memberNumber or password',
                received: { memberNumber: !!memberNumber, password: !!password }
            });
        }
        
        // Get user from database
        console.log('Querying database for member:', memberNumber);
        const user = await pool.query("SELECT * FROM member_users WHERE member_number = $1 AND is_active = true", [memberNumber]);
        
        console.log('Query result:', user.rows.length, 'users found');
        
        if (user.rows.length === 0) {
            return res.json({ 
                success: false, 
                message: 'User not found',
                memberNumber: memberNumber 
            });
        }
        
        const userData = user.rows[0];
        console.log('User found:', userData.user_name, userData.user_email);
        console.log('Password hash length:', userData.user_password?.length);
        
        // Test bcrypt import
        console.log('Testing bcrypt import...');
        const bcrypt = require('bcrypt');
        console.log('Bcrypt imported successfully');
        
        // Test password comparison
        console.log('Comparing passwords...');
        const validPassword = await bcrypt.compare(password, userData.user_password);
        console.log('Password comparison result:', validPassword);
        
        res.json({
            success: true,
            userFound: true,
            passwordMatch: validPassword,
            userInfo: {
                memberNumber: userData.member_number,
                userName: userData.user_name,
                userEmail: userData.user_email,
                hashLength: userData.user_password?.length
            }
        });
        
    } catch (err) {
        console.error('=== PASSWORD DEBUG ERROR ===');
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            success: false,
            error: err.message,
            errorType: err.constructor.name
        });
    }
});

module.exports = router;
