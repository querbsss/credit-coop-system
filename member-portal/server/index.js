const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

//middlewares
app.use(express.json());
app.use(cors());

// Serve uploaded files
app.use('/loan_applications', express.static('loan_applications'));
app.use('/payment_references', express.static('payment_references'));

//routes

//login route
app.use('/auth', require('./routes/coopauth'));

app.use('/dashboard', require('./routes/dashboard'));

// Loan application routes
const { setupLoanApplicationRoutes } = require('./loan_application_integration');
setupLoanApplicationRoutes(app);

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, paymentRefsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '');
    cb(null, `payment_ref_${ts}_${Math.random().toString(16).slice(2)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG/PNG images are allowed'));
  }
});

app.post('/api/payment/reference-upload', upload.single('reference_image'), (req, res) => {
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

app.listen(5001, () => {
  console.log('Server is running on port 5001');
  console.log('Available endpoints:');
  console.log('  GET  / - Health check');
  console.log('  POST /auth/register - User registration');
  console.log('  POST /auth/login - User login');
  console.log('  GET  /auth/is-verify - Verify token');
  console.log('  GET  /dashboard - Get user dashboard data');
});