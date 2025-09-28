const router = require('express').Router();
const pool = require('../db_members');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validation = require('../middleware/validation');
const authorization = require('../middleware/authorization');

router.post('/register', validation, async (req, res) => {
    try {

        // 1. Get user input
        const { name, email, password } = req.body;

        // 2. Validate user input

        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if (user.rows.length !== 0){
            res.status(400).send("User already exists");
        }

        // 3. bcrypt the password

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const bcryptPassword = await bcrypt.hash(password, salt);
        
        // 4. Save user to database
        const newUser = await pool.query("INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *", [name, email, bcryptPassword]);

        // 5. Generate JWT token
        const token = jwtGenerator(newUser.rows[0].user_id);
        res.json({ token });
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

        // 3. Check if user exists in database (check both email and member number fields)
        let user;
        if (email) {
            user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
        } else {
            // Assuming you have a member_number field, if not, we'll use email field
            user = await pool.query("SELECT * FROM users WHERE user_email = $1", [memberNumber]);
        }

        if (user.rows.length === 0){
            return res.status(400).send("User does not exist");
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

module.exports = router;