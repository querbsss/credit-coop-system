const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3004;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://credit-coop-landing.onrender.com',
        'https://credit-coop-member-portal.onrender.com',
        'https://credit-coop-staff-portal.onrender.com',
        'https://credit-coop-staff-portal-x4ql.onrender.com'
      ]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {

    // Accept both profileImage and idDocument fields, but only image files
    if ((file.fieldname === 'profileImage' || file.fieldname === 'idDocument') && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else if (file.fieldname !== 'profileImage' && file.fieldname !== 'idDocument') {
      cb(new Error('Unexpected field: ' + file.fieldname));
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});


// Log every incoming request for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Multer error handler (must be before global error handler)
app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    console.error('Multer error:', err);
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  next(err);
});

// Global error handler for all unhandled errors (including Multer and route errors)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err
  });
});


// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// API Routes (define BEFORE static files)
// Submit membership application
app.post('/api/membership-application', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 }
]), async (req, res) => {
  console.log('=== MEMBERSHIP APPLICATION ENDPOINT HIT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  try {
    const {
      // Basic membership information
      numberOfShares,
      amountSubscribe,
      date,
      membershipType,
      applicantsMembershipNumber,
      
      // Personal information
      lastName,
      firstName,
      middleName,
      suffix,
      address,
      contactNumber,
      typeOfAddress,
      occupiedSince,
      emailAddress,
      dateOfBirth,
      placeOfBirth,
      religion,
      age,
      gender,
      civilStatus,
      highestEducationalAttainment,
      
      // Family information
      spouseFullName,
      fathersFullName,
      mothersMaidenName,
      numberOfDependents,
      
      // Professional information
      occupation,
      annualIncome,
      taxIdentificationNumber,
      identificationType,
      identificationNumber,
      employmentChoice,
      
      // Self employed
      businessType,
      businessAddress,
      
      // Employed
      employerTradeName,
      employerTinNumber,
      employerPhoneNumber,
      dateHiredFrom,
      dateHiredTo,
      employmentOccupation,
      employmentOccupationStatus,
      annualMonthlyIndicator,
      employmentIndustry,
      
      // Social and reference
      facebookAccount,
      referencePerson,
      referenceAddress,
      referenceContactNumber
    } = req.body;

    const profileImagePath = req.files && req.files['profileImage'] ? req.files['profileImage'][0].filename : null;
    const idDocumentPath = req.files && req.files['idDocument'] ? req.files['idDocument'][0].filename : null;

    const query = `
      INSERT INTO membership_applications (
        number_of_shares, amount_subscribe, application_date, membership_type, 
        applicants_membership_number, last_name, first_name, middle_name, suffix,
        address, contact_number, type_of_address, occupied_since, email_address,
        date_of_birth, place_of_birth, religion, age, gender, civil_status,
        highest_educational_attainment, spouse_full_name, fathers_full_name,
        mothers_maiden_name, number_of_dependents, occupation, annual_income,
        tax_identification_number, identification_type, identification_number,
        employment_choice, business_type, business_address, employer_trade_name,
        employer_tin_number, employer_phone_number, date_hired_from, date_hired_to,
        employment_occupation, employment_occupation_status, annual_monthly_indicator,
        employment_industry, facebook_account, reference_person, reference_address,
        reference_contact_number, profile_image_path, id_document_path, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47,
        $48, 'pending', CURRENT_TIMESTAMP
      ) RETURNING application_id
    `;

    const values = [
      numberOfShares, amountSubscribe, date, membershipType, applicantsMembershipNumber,
      lastName, firstName, middleName, suffix, address, contactNumber, typeOfAddress,
      occupiedSince, emailAddress, dateOfBirth, placeOfBirth, religion, age, gender,
      civilStatus, highestEducationalAttainment, spouseFullName, fathersFullName,
      mothersMaidenName, numberOfDependents, occupation, annualIncome,
      taxIdentificationNumber, identificationType, identificationNumber,
      employmentChoice, businessType, businessAddress, employerTradeName,
      employerTinNumber, employerPhoneNumber, dateHiredFrom, dateHiredTo,
      employmentOccupation, employmentOccupationStatus, annualMonthlyIndicator,
      employmentIndustry, facebookAccount, referencePerson, referenceAddress,
      referenceContactNumber, profileImagePath, idDocumentPath
    ];

    const result = await pool.query(query, values);
    console.log('DEBUG: Query executed successfully');
    console.log('DEBUG: Inserted application ID:', result.rows[0].application_id);

    res.status(201).json({
      success: true,
      message: 'Membership application submitted successfully!',
      applicationId: result.rows[0].application_id
    });
  } catch (error) {
    console.error('DEBUG: Error submitting membership application:', error);
    // Always return JSON, even on unexpected errors
    if (res.headersSent) {
      console.error('DEBUG: Response headers already sent, skipping response');
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit membership application',
      error: error.message || 'Unknown error'
    });
  } finally {
    console.log('DEBUG: Response sent for membership application');
  }
});

// Get all membership applications (for staff dashboard)
app.get('/api/membership-applications', async (req, res) => {
  try {
    const query = `
      SELECT * FROM membership_applications 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      applications: result.rows
    });

  } catch (error) {
    console.error('Error fetching membership applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch membership applications',
      error: error.message
    });
  }
});

// Update application status
app.put('/api/membership-applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, membershipNumber } = req.body;

    let query, params;

    if (membershipNumber) {
      // Include membership number in the update
      query = `
        UPDATE membership_applications 
        SET status = $1, review_notes = $2, reviewed_at = CURRENT_TIMESTAMP, applicants_membership_number = $4
        WHERE application_id = $3
        RETURNING *
      `;
      params = [status, reviewNotes, id, membershipNumber];
    } else {
      // Regular update without membership number
      query = `
        UPDATE membership_applications 
        SET status = $1, review_notes = $2, reviewed_at = CURRENT_TIMESTAMP
        WHERE application_id = $3
        RETURNING *
      `;
      params = [status, reviewNotes, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Backend server is running',
      database: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test endpoint to check if table exists
app.get('/test-table', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'membership_applications'
    `);
    
    if (result.rows.length > 0) {
      res.json({ 
        status: 'OK', 
        message: 'membership_applications table exists',
        table: result.rows[0]
      });
    } else {
      res.json({ 
        status: 'NOT_FOUND', 
        message: 'membership_applications table does not exist'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error checking table',
      error: error.message
    });
  }
});

// Catch-all for unmatched API routes (placed AFTER all API routes so real endpoints are matched first)
app.all('/api/*', (req, res) => {
  console.warn(`Unmatched API route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.originalUrl
  });
});


// Serve static files from React build (AFTER API routes)
app.use(express.static(path.join(__dirname, '../build')));


// Catch-all handler: send back React's index.html file for any non-API GET routes only

// Only serve index.html for non-API GET requests
app.get(/^\/(?!api).*/, (req, res) => {
  const indexPath = path.join(__dirname, '../build/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend build not found' });
  }
});

// Global error handler for all unhandled errors (including Multer and route errors)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err
  });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
