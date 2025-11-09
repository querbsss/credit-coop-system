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

// Get membership data for loan application auto-population
router.get('/member-data/:memberNumber', async (req, res) => {
    try {
        const { memberNumber } = req.params;
        
        console.log('Fetching membership data for member:', memberNumber);
        
        // Get membership application data
        const membershipQuery = `
            SELECT 
                first_name,
                last_name, 
                middle_name,
                suffix,
                address,
                contact_number,
                email_address,
                date_of_birth,
                place_of_birth,
                gender,
                civil_status,
                fathers_full_name,
                mothers_maiden_name,
                occupation,
                annual_income,
                business_address,
                employment_choice,
                business_type,
                employer_trade_name,
                employment_occupation
            FROM membership_applications 
            WHERE applicants_membership_number = $1
        `;
        
        const result = await pool.query(membershipQuery, [memberNumber]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Membership application not found for this member number'
            });
        }
        
        const membershipData = result.rows[0];
        
        // Map membership data to loan application format
        const loanFormData = {
            // Personal Information
            lastName: membershipData.last_name,
            firstName: membershipData.first_name,
            middleName: membershipData.middle_name,
            gender: membershipData.gender?.toLowerCase(),
            civilStatus: membershipData.civil_status?.toLowerCase(),
            birthDate: membershipData.date_of_birth,
            
            // Contact Information  
            mobileNumber: membershipData.contact_number,
            emailAddress: membershipData.email_address,
            
            // Address Information
            currentAddress: membershipData.address,
            permanentAddress: membershipData.address, // Use same address as default
            
            // Family Information
            spouseName: membershipData.civil_status?.toLowerCase() === 'married' ? '' : null, // Leave empty if married, they can fill
            
            // Employment Information
            companyBusiness: membershipData.employer_trade_name || membershipData.business_type,
            designationPosition: membershipData.occupation || membershipData.employment_occupation,
            
            // Additional data that might be useful
            annualIncome: membershipData.annual_income,
            businessAddress: membershipData.business_address,
            employmentChoice: membershipData.employment_choice,
            fatherName: membershipData.fathers_full_name,
            motherName: membershipData.mothers_maiden_name
        };
        
        console.log('Mapped loan form data:', loanFormData);
        
        res.json({
            success: true,
            data: loanFormData,
            memberNumber: memberNumber
        });
        
    } catch (err) {
        console.error('Error fetching membership data for loan:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch membership data',
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
        
        console.log('Update request received:', { id, status, notes, reviewNotes, membershipNumber });
        
        // Use reviewNotes if provided, otherwise use notes
        const finalNotes = reviewNotes || notes;
        
        // Validate the application exists first
        const existingApp = await pool.query('SELECT * FROM membership_applications WHERE application_id = $1', [id]);
        
        if (existingApp.rows.length === 0) {
            console.log('Application not found:', id);
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        console.log('Updating application:', { id, status, finalNotes, membershipNumber });
        
        const result = await pool.query(
            `UPDATE membership_applications 
             SET status = $1, review_notes = $2, applicants_membership_number = $3
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
        
        console.log('Application updated successfully:', result.rows[0]);
        
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
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

module.exports = router;