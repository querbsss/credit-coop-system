const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwtgenerator = require('../utils/jwtgenerator');
const validinfo = require('../middleware/validation');
const authorization = require('../middleware/authorization');
//register 

router.post('/register', validinfo, async (req, res) => {
    try {
        
        //1. destructure the req.body (name, email, password)

        const { name, email, password } = req.body;

        //2. check if user exists (if exists throw error)
       
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
        
        if (user.rows.length !== 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        //3. bcrypt the password

        const saltRound = 10;
        const gensalt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, gensalt);
        
        //4. enter the new user inside our db
        const newUser = await pool.query(
            "INSERT INTO users (user_name, user_email, user_password, user_role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, bcryptPassword, 'cashier'] // Default role is cashier
        );

        //5. generate jwt token
        const token = jwtgenerator(newUser.rows[0].user_id, newUser.rows[0].user_role);
        return res.json({ token, user: { id: newUser.rows[0].user_id, name: newUser.rows[0].user_name, email: newUser.rows[0].user_email, role: newUser.rows[0].user_role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}); 

//login route
router.post('/login', validinfo, async (req, res) => {
    try {
        //1. destructure the req.body
        const { email, password } = req.body;

        //2. check if user doesn't exist (if not then we throw error)
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Password or Email is incorrect" });
        }

        //3. check if incoming password is the same as the database password
        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Password or Email is incorrect" });
        }

        //4. give them the jwt token
        const token = jwtgenerator(user.rows[0].user_id, user.rows[0].user_role);
        return res.json({ 
            token, 
            user: { 
                id: user.rows[0].user_id, 
                name: user.rows[0].user_name, 
                email: user.rows[0].user_email, 
                role: user.rows[0].user_role 
            } 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/is-verify', authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user profile with role information
router.get('/profile', authorization, async (req, res) => {
    try {
        const userId = typeof req.user === 'object' ? req.user.id : req.user;
        const user = await pool.query("SELECT user_id, user_name, user_email, user_role FROM users WHERE user_id = $1", [userId]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json({
            id: user.rows[0].user_id,
            name: user.rows[0].user_name,
            email: user.rows[0].user_email,
            role: user.rows[0].user_role
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;  