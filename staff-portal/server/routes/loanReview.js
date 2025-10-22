const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { spawn } = require('child_process');
const path = require('path');

// Connect to members database for loan applications
const membersPool = new Pool({
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    database: 'slz_members',
    port: 5432,
});

// Get all loan applications for review
router.get('/applications', async (req, res) => {
    try {
        const { status, reviewer_role, reviewer_id } = req.query;
        
        let query = `
            SELECT 
                la.*,
                u.user_name as applicant_name,
                u.user_email as applicant_email,
                lo.user_name as loan_officer_name,
                m.user_name as manager_name
            FROM loan_applications la
            LEFT JOIN users u ON la.user_id = u.user_id
            LEFT JOIN users lo ON la.loan_officer_id = lo.user_id
            LEFT JOIN users m ON la.manager_id = m.user_id
        `;
        
        const conditions = [];
        const params = [];
        
        if (status) {
            conditions.push(`la.review_status = $${params.length + 1}`);
            params.push(status);
        }
        
        if (reviewer_role === 'loan_officer' && reviewer_id) {
            conditions.push(`(la.loan_officer_id = $${params.length + 1} OR la.loan_officer_id IS NULL)`);
            params.push(reviewer_id);
        }
        
        if (reviewer_role === 'manager' && reviewer_id) {
            conditions.push(`la.review_status = 'under_review'`);
        }
        
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        query += ` ORDER BY la.submitted_at DESC`;
        
        const result = await membersPool.query(query, params);
        
        res.json({
            success: true,
            applications: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching loan applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan applications'
        });
    }
});

// Get single loan application details
router.get('/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                la.*,
                u.user_name as applicant_name,
                u.user_email as applicant_email,
                lo.user_name as loan_officer_name,
                m.user_name as manager_name
            FROM loan_applications la
            LEFT JOIN users u ON la.user_id = u.user_id
            LEFT JOIN users lo ON la.loan_officer_id = lo.user_id
            LEFT JOIN users m ON la.manager_id = m.user_id
            WHERE la.application_id = $1
        `;
        
        const result = await membersPool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        // Get review history
        const historyQuery = `
            SELECT 
                lrh.*,
                u.user_name as reviewer_name
            FROM loan_review_history lrh
            LEFT JOIN users u ON lrh.reviewer_id = u.user_id
            WHERE lrh.application_id = $1
            ORDER BY lrh.created_at DESC
        `;
        
        const historyResult = await membersPool.query(historyQuery, [id]);
        
        res.json({
            success: true,
            application: result.rows[0],
            reviewHistory: historyResult.rows
        });
        
    } catch (error) {
        console.error('Error fetching loan application:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan application'
        });
    }
});

// Assign loan officer to application
router.post('/applications/:id/assign', async (req, res) => {
    try {
        const { id } = req.params;
        const { loan_officer_id } = req.body;
        
        const query = `
            UPDATE loan_applications 
            SET loan_officer_id = $1, review_status = 'under_review'
            WHERE application_id = $2 AND review_status = 'pending_review'
            RETURNING *
        `;
        
        const result = await membersPool.query(query, [loan_officer_id, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or already assigned'
            });
        }
        
        // Add to review history - handle missing loan officer ID gracefully
        try {
            const userCheck = await membersPool.query(
                'SELECT user_id FROM users WHERE user_id = $1',
                [loan_officer_id]
            );
            
            let finalOfficerId = loan_officer_id;
            if (userCheck.rows.length === 0) {
                console.warn(`Loan officer ID ${loan_officer_id} not found in members database.`);
                
                // Create a system user for staff operations if it doesn't exist
                const systemUserId = '00000000-0000-0000-0000-000000000001'; // Fixed UUID for system user
                await membersPool.query(
                    `INSERT INTO users (user_id, user_name, user_email, user_role, user_password)
                     VALUES ($1, 'Staff Portal System', 'system@staffportal.local', 'admin', 'system-hash')
                     ON CONFLICT (user_id) DO NOTHING`,
                    [systemUserId]
                );
                
                finalOfficerId = systemUserId;
            }
            
            await membersPool.query(
                `INSERT INTO loan_review_history (application_id, reviewer_id, reviewer_role, action_taken, notes)
                 VALUES ($1, $2, 'loan_officer', 'assigned', $3)`,
                [id, finalOfficerId, finalOfficerId === systemUserId ? 
                    `Application assigned for review (staff officer: ${loan_officer_id})` : 
                    'Application assigned for review']
            );
        } catch (historyError) {
            console.error('Error adding to review history:', historyError);
            // Don't fail the main operation if history insertion fails
        }
        
        res.json({
            success: true,
            message: 'Application assigned successfully',
            application: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error assigning application:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning application'
        });
    }
});

// Loan officer review action
router.post('/applications/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            action, 
            notes, 
            reviewer_id, 
            loan_amount, 
            interest_rate, 
            loan_term_months,
            loan_purpose,
            credit_score,
            monthly_income,
            employment_status,
            collateral_description,
            priority_level
        } = req.body;
        
        // Sanitize and coerce potentially empty string inputs for numeric fields
        const toNullableNumber = (value) => {
            if (value === undefined || value === null || value === '') return null;
            const num = Number(value);
            return Number.isFinite(num) ? num : null;
        };

        const toNullableInteger = (value) => {
            if (value === undefined || value === null || value === '') return null;
            const num = parseInt(value, 10);
            return Number.isFinite(num) ? num : null;
        };

        const sanitizedLoanAmount = toNullableNumber(loan_amount);
        const sanitizedInterestRate = toNullableNumber(interest_rate);
        const sanitizedLoanTermMonths = toNullableInteger(loan_term_months);
        const sanitizedCreditScore = toNullableInteger(credit_score);
        const sanitizedMonthlyIncome = toNullableNumber(monthly_income);

        let updateQuery = '';
        let status = '';
        let params = [];
        
        switch (action) {
            case 'approve_for_manager':
                updateQuery = `
                    UPDATE loan_applications 
                    SET 
                        review_status = 'under_review',
                        loan_officer_notes = $1,
                        reviewed_at = CURRENT_TIMESTAMP,
                        loan_amount = $2,
                        interest_rate = $3,
                        loan_term_months = $4,
                        loan_purpose = $5,
                        credit_score = $6,
                        monthly_income = $7,
                        employment_status = $8,
                        collateral_description = $9,
                        priority_level = $10
                    WHERE application_id = $11
                    RETURNING *
                `;
                status = 'under_review';
                params = [
                    notes,
                    sanitizedLoanAmount,
                    sanitizedInterestRate,
                    sanitizedLoanTermMonths,
                    loan_purpose,
                    sanitizedCreditScore,
                    sanitizedMonthlyIncome,
                    employment_status,
                    collateral_description,
                    priority_level,
                    id
                ];
                break;
                
            case 'return_to_member':
                updateQuery = `
                    UPDATE loan_applications 
                    SET 
                        review_status = 'returned',
                        loan_officer_notes = $1,
                        reviewed_at = CURRENT_TIMESTAMP
                    WHERE application_id = $2
                    RETURNING *
                `;
                status = 'returned';
                params = [
                    notes,
                    id
                ];
                break;
                
            case 'reject':
                updateQuery = `
                    UPDATE loan_applications 
                    SET 
                        review_status = 'rejected',
                        loan_officer_notes = $1,
                        reviewed_at = CURRENT_TIMESTAMP,
                        rejected_at = CURRENT_TIMESTAMP
                    WHERE application_id = $2
                    RETURNING *
                `;
                status = 'rejected';
                params = [
                    notes,
                    id
                ];
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action'
                });
        }
        
        // params are set per action above
        
        const result = await membersPool.query(updateQuery, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        // Add to review history - handle missing reviewer ID gracefully
        try {
            // Ensure reviewer_id exists in members DB by preferring the application's loan_officer_id
            let historyReviewerId = reviewer_id;
            const appReviewer = await membersPool.query(
                'SELECT loan_officer_id FROM loan_applications WHERE application_id = $1',
                [id]
            );
            if (appReviewer.rows[0] && appReviewer.rows[0].loan_officer_id) {
                historyReviewerId = appReviewer.rows[0].loan_officer_id;
            }
            
            // Check if the reviewer exists in the users table
            const userCheck = await membersPool.query(
                'SELECT user_id FROM users WHERE user_id = $1',
                [historyReviewerId]
            );
            
            let finalReviewerId = historyReviewerId;
            let reviewerNotes = notes;
            
            if (userCheck.rows.length === 0) {
                console.warn(`Reviewer ID ${historyReviewerId} not found in members database.`);
                
                // Create a system user for staff operations if it doesn't exist
                const systemUserId = '00000000-0000-0000-0000-000000000001'; // Fixed UUID for system user
                await membersPool.query(
                    `INSERT INTO users (user_id, user_name, user_email, user_role, user_password)
                     VALUES ($1, 'Staff Portal System', 'system@staffportal.local', 'admin', 'system-hash')
                     ON CONFLICT (user_id) DO NOTHING`,
                    [systemUserId]
                );
                
                finalReviewerId = systemUserId;
                reviewerNotes = `${reviewerNotes} (Review by staff portal officer: ${historyReviewerId})`;
            }
            
            await membersPool.query(
                `INSERT INTO loan_review_history (application_id, reviewer_id, reviewer_role, action_taken, notes)
                 VALUES ($1, $2, 'loan_officer', $3, $4)`,
                [id, finalReviewerId, action, reviewerNotes]
            );
        } catch (historyError) {
            console.error('Error adding to review history:', historyError);
            // Don't fail the main operation if history insertion fails
        }
        
        res.json({
            success: true,
            message: `Application ${action} successfully`,
            application: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error reviewing application:', error);
        res.status(500).json({
            success: false,
            message: 'Error reviewing application'
        });
    }
});

// Manager approval/rejection
router.post('/applications/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes, manager_id } = req.body;
        
        let updateQuery = '';
        let status = '';
        
        if (action === 'approve') {
            updateQuery = `
                UPDATE loan_applications 
                SET 
                    review_status = 'approved',
                    manager_id = $1,
                    manager_notes = $2,
                    approved_at = CURRENT_TIMESTAMP
                WHERE application_id = $3 AND review_status = 'under_review'
                RETURNING *
            `;
            status = 'approved';
        } else if (action === 'reject') {
            updateQuery = `
                UPDATE loan_applications 
                SET 
                    review_status = 'rejected',
                    manager_id = $1,
                    manager_notes = $2,
                    rejected_at = CURRENT_TIMESTAMP
                WHERE application_id = $3 AND review_status = 'under_review'
                RETURNING *
            `;
            status = 'rejected';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
        }
        
        const result = await membersPool.query(updateQuery, [manager_id, notes, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or not ready for approval'
            });
        }
        
        // Add to review history - handle missing manager ID gracefully
        try {
            // Check if the manager_id exists in the users table
            const userCheck = await membersPool.query(
                'SELECT user_id FROM users WHERE user_id = $1',
                [manager_id]
            );
            
            let reviewerId = manager_id;
            let reviewerNotes = notes || `Decision: ${action} by manager`;
            
            if (userCheck.rows.length === 0) {
                // Manager doesn't exist in members database
                console.warn(`Manager ID ${manager_id} not found in members database. Creating system entry.`);
                
                // Create a system user for staff operations if it doesn't exist
                const systemUserId = '00000000-0000-0000-0000-000000000001'; // Fixed UUID for system user
                await membersPool.query(
                    `INSERT INTO users (user_id, user_name, user_email, user_role, user_password)
                     VALUES ($1, 'Staff Portal System', 'system@staffportal.local', 'admin', 'system-hash')
                     ON CONFLICT (user_id) DO NOTHING`,
                    [systemUserId]
                );
                
                reviewerId = systemUserId;
                reviewerNotes = `${reviewerNotes} (Decision made by staff portal manager: ${manager_id})`;
            }
            
            // Insert review history
            await membersPool.query(
                `INSERT INTO loan_review_history (application_id, reviewer_id, reviewer_role, action_taken, notes)
                 VALUES ($1, $2, 'manager', $3, $4)`,
                [id, reviewerId, action, reviewerNotes]
            );
            
        } catch (historyError) {
            console.error('Error adding to review history:', historyError);
            // Don't fail the main operation if history insertion fails
        }
        
        res.json({
            success: true,
            message: `Application ${action}d successfully`,
            application: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error approving application:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving application'
        });
    }
});

// Get review statistics
router.get('/statistics', async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_applications,
                COUNT(CASE WHEN review_status = 'pending_review' THEN 1 END) as pending_review,
                COUNT(CASE WHEN review_status = 'under_review' THEN 1 END) as under_review,
                COUNT(CASE WHEN review_status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN review_status = 'rejected' THEN 1 END) as rejected,
                COUNT(CASE WHEN review_status = 'returned' THEN 1 END) as returned,
                COUNT(CASE WHEN priority_level = 'high' THEN 1 END) as high_priority,
                COUNT(CASE WHEN priority_level = 'urgent' THEN 1 END) as urgent_priority
            FROM loan_applications
        `;
        
        const result = await membersPool.query(statsQuery);
        
        res.json({
            success: true,
            statistics: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// Get loan officers for assignment
router.get('/loan-officers', async (req, res) => {
    try {
        const query = `
            SELECT user_id, user_name, user_email
            FROM users 
            WHERE user_role = 'loan_officer'
            ORDER BY user_name
        `;
        
        const result = await membersPool.query(query);
        
        res.json({
            success: true,
            loan_officers: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching loan officers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan officers'
        });
    }
});

module.exports = router;
