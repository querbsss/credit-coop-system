const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const staffAuthorize = require('../middleware/authorization');
const membersPool = require('../db_members');

// Ensure member_users table schema exists
async function ensureMemberUsersSchema() {
    try {
        // Check if member_users table exists
        const tableCheck = await membersPool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = 'member_users'
        `);
        
        if (tableCheck.rows.length === 0) {
            console.log('Creating member_users table...');
            await membersPool.query(`
                CREATE TABLE member_users (
                    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_name VARCHAR(255) NOT NULL,
                    user_email VARCHAR(255) NOT NULL UNIQUE,
                    user_password VARCHAR(255) NOT NULL,
                    member_number VARCHAR(50) UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE
                )
            `);
            
            // Create indexes
            await membersPool.query(`CREATE INDEX idx_member_users_email ON member_users(user_email)`);
            await membersPool.query(`CREATE INDEX idx_member_users_member_number ON member_users(member_number)`);
            await membersPool.query(`CREATE INDEX idx_member_users_active ON member_users(is_active)`);
        } else {
            // Check if all required columns exist, if not add them
            const columnCheck = await membersPool.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'member_users' AND column_name IN ('created_at', 'updated_at', 'is_active')
            `);
            
            const existingColumns = columnCheck.rows.map(row => row.column_name);
            console.log('Existing columns:', existingColumns);
            
            if (!existingColumns.includes('created_at')) {
                console.log('Adding created_at column...');
                await membersPool.query(`
                    ALTER TABLE member_users 
                    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                `);
            }
            
            if (!existingColumns.includes('updated_at')) {
                console.log('Adding updated_at column...');
                await membersPool.query(`
                    ALTER TABLE member_users 
                    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                `);
            }
            
            if (!existingColumns.includes('is_active')) {
                console.log('Adding is_active column...');
                await membersPool.query(`
                    ALTER TABLE member_users 
                    ADD COLUMN is_active BOOLEAN DEFAULT TRUE
                `);
            }
        }
    } catch (e) {
        console.error('Error ensuring member_users schema', e);
    }
}

ensureMemberUsersSchema();

// Test endpoint to check database connection and table
router.get('/test-db', async (req, res) => {
    try {
        // Test database connection
        const testQuery = await membersPool.query('SELECT NOW()');
        console.log('Database connection successful:', testQuery.rows[0]);
        
        // Check if table exists
        const tableExists = await membersPool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = 'member_users'
        `);
        
        // Get table schema
        const tableSchema = await membersPool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'member_users'
            ORDER BY ordinal_position
        `);
        
        // Count existing records
        const recordCount = await membersPool.query('SELECT COUNT(*) FROM member_users');
        
        res.json({
            success: true,
            database_connected: true,
            current_time: testQuery.rows[0].now,
            table_exists: tableExists.rows.length > 0,
            table_schema: tableSchema.rows,
            record_count: parseInt(recordCount.rows[0].count)
        });
        
    } catch (err) {
        console.error('Database test error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get member count - accessible to all authenticated users for dashboard
router.get('/member-count', staffAuthorize, async (req, res) => {
    try {
        const countResult = await membersPool.query('SELECT COUNT(*) FROM member_users WHERE is_active = true');
        const totalCount = parseInt(countResult.rows[0].count);
        
        console.log(`Member count endpoint called - Total active members: ${totalCount}`);
        
        res.json({
            success: true,
            count: totalCount,
            active_members: totalCount
        });
    } catch (err) {
        console.error('Error fetching member count:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch member count',
            error: err.message 
        });
    }
});

// IT Admin: Get all members with pagination and search
router.get('/members', staffAuthorize, async (req, res) => {
    try {
        // Only allow it_admin role
        const role = req.user?.role;
        console.log('User role requesting members:', role);
        
        if (role !== 'it_admin') {
            console.log('Access denied - role is not it_admin');
            return res.status(403).json({ success: false, message: 'Access denied. IT Admin role required.' });
        }

        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        let queryParams = [];
        
        if (search) {
            whereClause += `WHERE (user_name ILIKE $1 OR user_email ILIKE $1 OR member_number ILIKE $1)`;
            queryParams.push(`%${search}%`);
        }
        
        if (status !== 'all') {
            const statusCondition = status === 'active' ? 'is_active = true' : 'is_active = false';
            whereClause += whereClause ? ` AND ${statusCondition}` : `WHERE ${statusCondition}`;
        }
        
        // Get total count
        const countQuery = `SELECT COUNT(*) FROM member_users ${whereClause}`;
        const countResult = await membersPool.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);
        
        // Debug: Check table schema
        try {
            const schemaCheck = await membersPool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'member_users' 
                ORDER BY column_name
            `);
            console.log('member_users table schema:', schemaCheck.rows);
        } catch (schemaErr) {
            console.error('Error checking schema:', schemaErr);
        }
        
        // Get members with pagination
        const membersQuery = `
            SELECT user_id, user_name, user_email, member_number, created_at, updated_at, is_active
            FROM member_users 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;
        
        // Debugging: Log the query and parameters before execution
        console.log('Executing query:', membersQuery);
        console.log('Query parameters:', [...queryParams, limit, offset]);
        
        const membersResult = await membersPool.query(membersQuery, [...queryParams, limit, offset]);
        
        // Debug: Also check total count in table
        const totalCountCheck = await membersPool.query('SELECT COUNT(*) as total FROM member_users');
        console.log('Total records in member_users table:', totalCountCheck.rows[0].total);
        
        // Debug: Show all records for debugging
        const allRecords = await membersPool.query('SELECT user_id, user_name, member_number FROM member_users ORDER BY created_at DESC');
        console.log('All records in table:', allRecords.rows);
        
        return res.json({
            success: true,
            members: membersResult.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalMembers: total,
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error('Error fetching members:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch members',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// IT Admin: Get single member by ID
router.get('/members/:id', staffAuthorize, async (req, res) => {
    try {
        const role = req.user?.role;
        if (role !== 'it_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { id } = req.params;
        const result = await membersPool.query(
            `SELECT user_id, user_name, user_email, member_number, created_at, updated_at, is_active 
             FROM member_users WHERE user_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        return res.json({ success: true, member: result.rows[0] });
    } catch (err) {
        console.error('Error fetching member:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch member' });
    }
});

// IT Admin: Create member account
router.post('/members', staffAuthorize, async (req, res) => {
    const client = await membersPool.connect();
    
    try {
        // Only allow it_admin role
        const role = req.user?.role;
        if (role !== 'it_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        console.log('Creating member with data:', req.body);
        console.log('Database config:', {
            database: membersPool.options.database,
            host: membersPool.options.host,
            user: membersPool.options.user
        });

        await client.query('BEGIN');

        const { member_number, default_password, member_name, user_email } = req.body;
        if (!member_number || !default_password || !user_email) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: 'member_number, user_email, and default_password are required' 
            });
        }

        // Hash the password
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(default_password, salt);

        console.log('Password hashed successfully');

        // Check duplicates
        const existing = await client.query(
            `SELECT user_id FROM member_users WHERE member_number = $1 OR user_email = $2`,
            [member_number, user_email]
        );
        
        console.log('Duplicate check result:', existing.rows.length);
        
        if (existing.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'Member account already exists with this member number or email' });
        }

        // Use provided member_name or default to member_number if null/empty
        const finalMemberName = member_name || `Member ${member_number}`;

        console.log('Inserting member:', {
            finalMemberName,
            user_email,
            member_number,
            passwordLength: hash.length
        });

        const insert = await client.query(
            `INSERT INTO member_users (user_name, user_email, user_password, member_number) 
             VALUES ($1, $2, $3, $4) RETURNING user_id, member_number, user_name, user_email, created_at, is_active`,
            [finalMemberName, user_email, hash, member_number]
        );

        console.log('Insert successful, returning:', insert.rows[0]);

        // Explicitly commit the transaction
        await client.query('COMMIT');
        console.log('Transaction committed successfully');

        // Double-check that the record was saved
        const verifyInsert = await client.query(
            `SELECT user_id, user_name, user_email, member_number FROM member_users WHERE user_id = $1`,
            [insert.rows[0].user_id]
        );
        
        console.log('Verification query result:', verifyInsert.rows);

        return res.json({ success: true, member: insert.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating member account:', err);
        
        // Provide more specific error messages
        if (err.code === '23502') {
            return res.status(400).json({ 
                success: false, 
                message: 'Required field missing. Please ensure all required fields are provided.',
                details: err.detail
            });
        } else if (err.code === '23505') {
            return res.status(409).json({ 
                success: false, 
                message: 'Member account already exists with this member number or email.'
            });
        }
        
        return res.status(500).json({ success: false, message: 'Failed to create member account' });
    } finally {
        client.release();
    }
});

// IT Admin: Update member account
router.put('/members/:id', staffAuthorize, async (req, res) => {
    try {
        const role = req.user?.role;
        if (role !== 'it_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { id } = req.params;
        const { user_name, user_email, member_number, is_active, new_password } = req.body;

        // Check if member exists
        const existing = await membersPool.query(
            `SELECT user_id FROM member_users WHERE user_id = $1`,
            [id]
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        let updateFields = [];
        let updateValues = [];
        let paramCount = 1;

        if (user_name !== undefined) {
            updateFields.push(`user_name = $${paramCount}`);
            updateValues.push(user_name);
            paramCount++;
        }

        if (user_email !== undefined) {
            // Check if email is already taken by another user
            const emailCheck = await membersPool.query(
                `SELECT user_id FROM member_users WHERE user_email = $1 AND user_id != $2`,
                [user_email, id]
            );
            if (emailCheck.rows.length > 0) {
                return res.status(409).json({ success: false, message: 'Email already taken by another member' });
            }
            updateFields.push(`user_email = $${paramCount}`);
            updateValues.push(user_email);
            paramCount++;
        }

        if (member_number !== undefined) {
            // Check if member number is already taken by another user
            const memberNumberCheck = await membersPool.query(
                `SELECT user_id FROM member_users WHERE member_number = $1 AND user_id != $2`,
                [member_number, id]
            );
            if (memberNumberCheck.rows.length > 0) {
                return res.status(409).json({ success: false, message: 'Member number already taken by another member' });
            }
            updateFields.push(`member_number = $${paramCount}`);
            updateValues.push(member_number);
            paramCount++;
        }

        if (is_active !== undefined) {
            updateFields.push(`is_active = $${paramCount}`);
            updateValues.push(is_active);
            paramCount++;
        }

        if (new_password) {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(new_password, salt);
            updateFields.push(`user_password = $${paramCount}`);
            updateValues.push(hash);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);

        const updateQuery = `
            UPDATE member_users 
            SET ${updateFields.join(', ')} 
            WHERE user_id = $${paramCount}
            RETURNING user_id, user_name, user_email, member_number, created_at, updated_at, is_active
        `;

        const result = await membersPool.query(updateQuery, updateValues);

        return res.json({ success: true, member: result.rows[0] });
    } catch (err) {
        console.error('Error updating member:', err);
        return res.status(500).json({ success: false, message: 'Failed to update member' });
    }
});

// IT Admin: Delete member account
router.delete('/members/:id', staffAuthorize, async (req, res) => {
    try {
        const role = req.user?.role;
        if (role !== 'it_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { id } = req.params;

        // Check if member exists
        const existing = await membersPool.query(
            `SELECT user_id, user_name FROM member_users WHERE user_id = $1`,
            [id]
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        // Delete the member
        await membersPool.query(`DELETE FROM member_users WHERE user_id = $1`, [id]);

        return res.json({ 
            success: true, 
            message: `Member ${existing.rows[0].user_name} has been deleted successfully` 
        });
    } catch (err) {
        console.error('Error deleting member:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete member' });
    }
});

// IT Admin: Toggle member active status
router.patch('/members/:id/toggle-status', staffAuthorize, async (req, res) => {
    try {
        const role = req.user?.role;
        if (role !== 'it_admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { id } = req.params;

        // Toggle the is_active status
        const result = await membersPool.query(
            `UPDATE member_users 
             SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = $1 
             RETURNING user_id, user_name, user_email, member_number, is_active`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const member = result.rows[0];
        return res.json({ 
            success: true, 
            member,
            message: `Member ${member.user_name} has been ${member.is_active ? 'activated' : 'deactivated'}` 
        });
    } catch (err) {
        console.error('Error toggling member status:', err);
        return res.status(500).json({ success: false, message: 'Failed to toggle member status' });
    }
});



module.exports = router;