const express = require('express');
const router = express.Router();
const pool = require('../db');
const staffAuthorize = require('../middleware/authorization');

// Get count of membership applications by status
router.get('/count', staffAuthorize, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = 'SELECT COUNT(*) FROM membership_applications';
        let queryParams = [];
        
        if (status) {
            query += ' WHERE status = $1';
            queryParams.push(status);
        }
        
        const result = await pool.query(query, queryParams);
        const count = parseInt(result.rows[0].count);
        
        res.json({
            success: true,
            count: count
        });
        
    } catch (err) {
        console.error('Error fetching application count:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch application count',
            error: err.message
        });
    }
});

// Get all membership applications with pagination and filtering
router.get('/', staffAuthorize, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        let queryParams = [];
        let paramCount = 1;
        
        // Build WHERE clause
        if (status) {
            whereClause += `WHERE status = $${paramCount}`;
            queryParams.push(status);
            paramCount++;
        }
        
        if (search) {
            const searchCondition = `(first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            whereClause += whereClause ? ` AND ${searchCondition}` : `WHERE ${searchCondition}`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }
        
        // Get total count
        const countQuery = `SELECT COUNT(*) FROM membership_applications ${whereClause}`;
        const countResult = await pool.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);
        
        // Get applications
        const applicationsQuery = `
            SELECT * FROM membership_applications 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `;
        
        const applicationsResult = await pool.query(applicationsQuery, [...queryParams, limit, offset]);
        
        res.json({
            success: true,
            applications: applicationsResult.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalApplications: total,
                limit: parseInt(limit)
            }
        });
        
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: err.message
        });
    }
});

// Update application status
router.put('/:id/status', staffAuthorize, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, reviewNotes, membershipNumber } = req.body;
        
        // Use reviewNotes if provided, otherwise use notes
        const finalNotes = reviewNotes || notes;
        
        const result = await pool.query(
            `UPDATE membership_applications 
             SET status = $1, notes = $2, applicants_membership_number = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE application_id = $4 
             RETURNING *`,
            [status, finalNotes, membershipNumber, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            application: result.rows[0],
            message: `Application ${status} successfully`
        });
        
    } catch (err) {
        console.error('Error updating application status:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update application status',
            error: err.message
        });
    }
});

module.exports = router;