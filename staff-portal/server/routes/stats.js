const router = require('express').Router();
const pool = require('../db_members');
const authorization = require('../middleware/authorization');

// Get total members count
router.get('/members-count', authorization, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM member_users 
            WHERE status = 'active'
        `);
        
        res.json({ 
            success: true,
            count: parseInt(result.rows[0].count) 
        });
    } catch (error) {
        console.error('Error counting members:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to get members count' 
        });
    }
});

// Get pending applications count
router.get('/pending-applications-count', authorization, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM membership_applications 
            WHERE status = 'pending'
        `);
        
        res.json({ 
            success: true,
            count: parseInt(result.rows[0].count) 
        });
    } catch (error) {
        console.error('Error counting pending applications:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to get pending applications count' 
        });
    }
});

module.exports = router;