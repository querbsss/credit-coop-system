const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db_members'); // Import database connection

//middlewares
app.use(express.json());

// Simple and effective CORS - allow all origins for now
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, Origin, X-Requested-With, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    origin: req.headers.origin
  });
  
  next();
});

// Handle preflight requests manually for debugging
app.options('*', (req, res) => {
  console.log('Preflight request received:', {
    origin: req.headers.origin,
    method: req.headers['access-control-request-method'],
    headers: req.headers['access-control-request-headers']
  });
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Serve uploaded files
app.use('/loan_applications', express.static('loan_applications'));
app.use('/payment_references', express.static('payment_references'));

//routes

//login route
console.log('Registering auth routes...');
try {
  const authRoutes = require('./routes/coopauth');
  app.use('/auth', authRoutes);
  console.log('✅ Auth routes registered successfully');
} catch (error) {
  console.error('❌ Error registering auth routes:', error);
}

console.log('Registering dashboard routes...');
try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes registered successfully');
} catch (error) {
  console.error('❌ Error registering dashboard routes:', error);
}

// Register payment routes
try {
  console.log('Registering payment routes...');
  const paymentRoutes = require('./routes/payment');
  app.use('/api/payment', paymentRoutes);
  console.log('✅ Payment routes registered successfully');
} catch (error) {
  console.error('❌ Error registering payment routes:', error);
}

// Add a simple test route
// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ 
    message: 'Server is working! Updated deployment.', 
    timestamp: new Date().toISOString(),
    version: '1.1.0' 
  });
});

// Test auth endpoint
app.post('/test-auth', (req, res) => {
  console.log('Test auth endpoint hit:', req.body);
  res.json({ message: 'Test auth endpoint working', body: req.body });
});

// Simple test login endpoint without middleware
app.post('/auth/simple-login', (req, res) => {
  console.log('Simple login endpoint hit:', req.body);
  res.json({ 
    message: 'Simple login endpoint working', 
    body: req.body,
    timestamp: new Date().toISOString() 
  });
});

// Database test endpoint to check member users
app.get('/test-db-members', async (req, res) => {
  try {
    const result = await pool.query('SELECT member_number, user_email, user_name, is_active FROM member_users LIMIT 5');
    console.log('Member users query result:', result.rows);
    res.json({ 
      message: 'Database query successful',
      members: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ 
      error: 'Database query failed',
      details: error.message
    });
  }
});

// Get membership data for loan application auto-population
app.get('/api/membership-data/:memberNumber', async (req, res) => {
  try {
    const { memberNumber } = req.params;
    
    console.log('Fetching membership data for loan application, member:', memberNumber);
    
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
    console.log('Found membership data:', membershipData);
    
    // Map membership data to loan application format
    const loanFormData = {
      // Personal Information
      lastName: membershipData.last_name || '',
      firstName: membershipData.first_name || '',
      middleName: membershipData.middle_name || '',
      gender: membershipData.gender?.toLowerCase() || '',
      civilStatus: membershipData.civil_status?.toLowerCase() || '',
      birthDate: membershipData.date_of_birth || '',
      
      // Contact Information  
      mobileNumber: membershipData.contact_number || '',
      emailAddress: membershipData.email_address || '',
      
      // Address Information
      currentAddress: membershipData.address || '',
      permanentAddress: membershipData.address || '', // Use same address as default
      
      // Employment Information
      companyBusiness: membershipData.employer_trade_name || membershipData.business_type || '',
      designationPosition: membershipData.occupation || membershipData.employment_occupation || '',
      
      // Additional data that might be useful for pre-filling
      annualIncome: membershipData.annual_income,
      businessAddress: membershipData.business_address || '',
      employmentChoice: membershipData.employment_choice || '',
      fatherName: membershipData.fathers_full_name || '',
      motherName: membershipData.mothers_maiden_name || ''
    };
    
    console.log('Mapped loan form data:', loanFormData);
    
    res.json({
      success: true,
      data: loanFormData,
      memberNumber: memberNumber,
      message: 'Membership data retrieved successfully'
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

// Add test user endpoint
app.post('/add-test-user', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('testpass123', saltRounds);
    
    const result = await pool.query(`
      INSERT INTO member_users (user_name, user_email, user_password, member_number, is_active) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (member_number) DO NOTHING
      RETURNING *
    `, [
      'Test User Account',
      'testuser@example.com', 
      hashedPassword,
      'TEST123',
      true
    ]);
    
    if (result.rows.length > 0) {
      res.json({ 
        message: 'Test user created successfully',
        user: {
          memberNumber: 'TEST123',
          email: 'testuser@example.com',
          password: 'testpass123'
        }
      });
    } else {
      res.json({ 
        message: 'Test user already exists',
        user: {
          memberNumber: 'TEST123',
          email: 'testuser@example.com',
          password: 'testpass123'
        }
      });
    }
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({ 
      error: 'Failed to create test user',
      details: error.message
    });
  }
});

// Configure multer for loan application file uploads
const loanUploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads', 'loan_documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
});

const loanUpload = multer({ 
    storage: loanUploadStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Loan application submission endpoint with database integration
app.post('/api/loan-application/submit', loanUpload.fields([
    { name: 'gov_id_file', maxCount: 1 },
    { name: 'company_id_file', maxCount: 1 }
]), async (req, res) => {
    try {
        // Extract form data
        const {
            user_id, memberEmail, dateFiled, loanType, membershipType,
            lastName, firstName, middleName, gender, civilStatus, birthDate,
            landline, mobileNumber, emailAddress,
            currentAddress, yearsOfStayCurrent, permanentAddress, yearsOfStayPermanent, homeOwnership,
            spouseName, numberOfChildren,
            dateHired, companyBusiness, contractPeriod, designationPosition, yearsInCompany
        } = req.body;

        // Get file paths (store relative paths for database)
        const govIdFilePath = req.files?.gov_id_file ? 
            `uploads/loan_documents/${req.files.gov_id_file[0].filename}` : null;
        const companyIdFilePath = req.files?.company_id_file ? 
            `uploads/loan_documents/${req.files.company_id_file[0].filename}` : null;

        // Validate required fields
        if (!memberEmail || !dateFiled || !loanType || !lastName || !firstName || !gender || 
            !civilStatus || !birthDate || !mobileNumber || !emailAddress || !currentAddress || 
            !yearsOfStayCurrent || !permanentAddress || !yearsOfStayPermanent || !homeOwnership) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get member number from member_users table using email
        let memberNumber = null;
        let actualUserId = null;
        
        try {
            const memberQuery = `
                SELECT user_id, member_number 
                FROM member_users 
                WHERE user_email = $1
            `;
            const memberResult = await pool.query(memberQuery, [memberEmail]);
            
            if (memberResult.rows.length > 0) {
                actualUserId = memberResult.rows[0].user_id;
                memberNumber = memberResult.rows[0].member_number;
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found in system'
                });
            }
        } catch (memberError) {
            console.error('Error finding member:', memberError);
            return res.status(500).json({
                success: false,
                message: 'Error validating member information'
            });
        }

        // Insert loan application into database
        const insertQuery = `
            INSERT INTO loan_applications (
                user_id, date_filed, loan_type, membership_type,
                last_name, first_name, middle_name, gender, civil_status, birth_date,
                landline, mobile_number, email_address,
                current_address, years_of_stay_current, permanent_address, years_of_stay_permanent, home_ownership,
                spouse_name, number_of_children,
                date_hired, company_business, contract_period, designation_position, years_in_company,
                gov_id_file_path, company_id_file_path,
                status, submitted_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, 'pending', NOW(), NOW()
            ) RETURNING application_id, submitted_at
        `;

        const values = [
            actualUserId, // Use the UUID from member_users table  
            dateFiled, 
            loanType, 
            membershipType,
            lastName, 
            firstName, 
            middleName || null, 
            gender, 
            civilStatus, 
            birthDate,
            landline || null, 
            mobileNumber, 
            emailAddress,
            currentAddress, 
            parseFloat(yearsOfStayCurrent), 
            permanentAddress, 
            parseFloat(yearsOfStayPermanent), 
            homeOwnership,
            spouseName || null, 
            numberOfChildren ? parseInt(numberOfChildren) : 0,
            dateHired || null, 
            companyBusiness || null, 
            contractPeriod || null, 
            designationPosition || null, 
            yearsInCompany ? parseFloat(yearsInCompany) : null,
            govIdFilePath, 
            companyIdFilePath
        ];

        const result = await pool.query(insertQuery, values);
        const applicationId = result.rows[0].application_id;
        const submittedAt = result.rows[0].submitted_at;

        console.log(`Loan application submitted successfully. ID: ${applicationId}, Member: ${memberNumber}`);
        
        res.json({
            success: true,
            message: 'Loan application submitted successfully!',
            application_id: applicationId,
            member_number: memberNumber,
            submitted_at: submittedAt,
            status: 'pending'
        });

    } catch (error) {
        console.error('Error submitting loan application:', error);
        
        // Clean up uploaded files on error
        if (req.files?.gov_id_file) {
            try {
                fs.unlinkSync(req.files.gov_id_file[0].path);
            } catch (cleanupError) {
                console.error('Error cleaning up gov_id_file:', cleanupError);
            }
        }
        if (req.files?.company_id_file) {
            try {
                fs.unlinkSync(req.files.company_id_file[0].path);
            } catch (cleanupError) {
                console.error('Error cleaning up company_id_file:', cleanupError);
            }
        }
        
    // Log the full error for debugging
    console.error('Loan application DB error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting loan application',
      error: error.message || error
    });
    }
});

// Get loan applications for a user (by email)
app.get('/api/loan-applications/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        // First get the user_id from member_users table
        const memberQuery = `SELECT user_id FROM member_users WHERE user_email = $1`;
        const memberResult = await pool.query(memberQuery, [email]);
        
        if (memberResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        const userId = memberResult.rows[0].user_id;
        
        const query = `
            SELECT 
                application_id,
                member_number,
                loan_type,
                membership_type,
                CONCAT(first_name, ' ', COALESCE(middle_name || ' ', ''), last_name) as full_name,
                status,
                submitted_at,
                reviewed_at,
                date_filed,
                mobile_number,
                email_address
            FROM loan_applications 
            WHERE user_id = $1 
            ORDER BY submitted_at DESC
        `;
        
        const result = await pool.query(query, [userId]);
        
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

// Get detailed loan application by ID
app.get('/api/loan-application/:application_id', async (req, res) => {
    try {
        const { application_id } = req.params;
        
        const query = `SELECT * FROM loan_applications WHERE application_id = $1`;
        const result = await pool.query(query, [application_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan application not found'
            });
        }
        
        res.json({
            success: true,
            application: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error fetching loan application details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loan application details'
        });
    }
});

// Payment dues API endpoint
app.get('/api/payment-dues', (req, res) => {
  try {
    // Mock payment dues data - in real implementation, this would come from database
    const mockDues = [
      {
        id: 1,
        type: 'Monthly Loan Payment',
        amount: 15000.00,
        dueDate: '2024-01-15',
        status: 'overdue',
        description: 'Auto Loan - Monthly installment',
        accountNumber: 'LOAN-001-2023',
        daysOverdue: 5
      },
      {
        id: 2,
        type: 'Membership Fee',
        amount: 500.00,
        dueDate: '2024-01-20',
        status: 'due_soon',
        description: 'Annual membership fee',
        accountNumber: 'MEM-001-2024',
        daysUntilDue: 2
      },
      {
        id: 3,
        type: 'Insurance Premium',
        amount: 2500.00,
        dueDate: '2024-01-25',
        status: 'current',
        description: 'Life insurance premium',
        accountNumber: 'INS-001-2024',
        daysUntilDue: 7
      },
      {
        id: 4,
        type: 'Savings Contribution',
        amount: 2000.00,
        dueDate: '2024-02-01',
        status: 'current',
        description: 'Monthly savings contribution',
        accountNumber: 'SAV-001-2024',
        daysUntilDue: 14
      }
    ];
    
    res.json({ success: true, paymentDues: mockDues });
  } catch (err) {
    console.error('Error fetching payment dues:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payment dues' });
  }
});

// Payment history API endpoint (mock data)
app.get('/api/payment-history', (req, res) => {
  try {
    const history = [
      {
        id: 101,
        type: 'loan',
        title: 'Auto Loan - Monthly installment',
        amount: 15000.0,
        paidAt: '2024-01-10T09:45:00Z',
        reference: 'PR-20240110-0001',
        status: 'confirmed'
      },
      {
        id: 102,
        type: 'membership',
        title: 'Annual Membership Fee',
        amount: 500.0,
        paidAt: '2024-01-05T14:20:00Z',
        reference: 'PR-20240105-0007',
        status: 'confirmed'
      },
      {
        id: 103,
        type: 'insurance',
        title: 'Life Insurance Premium',
        amount: 2500.0,
        paidAt: '2023-12-28T11:10:00Z',
        reference: 'PR-20231228-0012',
        status: 'pending'
      }
    ];

    res.json({ success: true, history });
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
});

// Payment history API endpoint (mock data)
app.get('/api/payment-history', (req, res) => {
  try {
    const history = [
      {
        id: 101,
        type: 'loan',
        title: 'Auto Loan - Monthly installment',
        amount: 15000.0,
        paidAt: '2024-01-10T09:45:00Z',
        reference: 'PR-20240110-0001',
        status: 'confirmed'
      },
      {
        id: 102,
        type: 'membership',
        title: 'Annual Membership Fee',
        amount: 500.0,
        paidAt: '2024-01-05T14:20:00Z',
        reference: 'PR-20240105-0007',
        status: 'confirmed'
      },
      {
        id: 103,
        type: 'insurance',
        title: 'Life Insurance Premium',
        amount: 2500.0,
        paidAt: '2023-12-28T11:10:00Z',
        reference: 'PR-20231228-0012',
        status: 'pending'
      }
    ];

    res.json({ success: true, history });
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
});

// Payment reference upload endpoint
const paymentRefsDir = path.join(__dirname, 'payment_references');
if (!fs.existsSync(paymentRefsDir)) {
  fs.mkdirSync(paymentRefsDir, { recursive: true });
}

const paymentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, paymentRefsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '');
    cb(null, `payment_ref_${ts}_${Math.random().toString(16).slice(2)}${ext}`);
  }
});

const paymentUpload = multer({
  storage: paymentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG/PNG images are allowed'));
  }
});

app.post('/api/payment/reference-upload', paymentUpload.single('reference_image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const publicPath = `payment_references/${req.file.filename}`;
    return res.json({ success: true, path: publicPath });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Member Portal Server is running!', 
    status: 'OK',
    endpoints: {
      auth: '/auth',
      dashboard: '/dashboard',
      health: '/'
    }
  });
});

const PORT = process.env.PORT || 5001;

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
  });
});

// Catch 404 routes
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📋 Available endpoints:');
  console.log('  GET  / - Health check');
  console.log('  POST /auth/register - User registration');
  console.log('  POST /auth/login - User login');
  console.log('  GET  /auth/is-verify - Verify token');
  console.log('  GET  /dashboard - Get user dashboard data');
});

// Handle server startup errors
server.on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});
