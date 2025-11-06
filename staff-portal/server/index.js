const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json()); //req body
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://credit-coop-staff-portal.onrender.com', 
        'https://credit-coop-staff-portal-wfvp.onrender.com',
        'https://credit-coop-landing.onrender.com', 
        'https://credit-coop-member-portal.onrender.com'
      ]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

//ROUTES

//register and login routes
console.log('Registering auth routes...');
try {
  const authRoutes = require('./routes/coopauth');
  app.use('/auth', authRoutes);
  console.log('Auth routes registered successfully');
} catch (error) {
  console.error('Error loading auth routes:', error.message);
  console.error('Stack trace:', error.stack);
}

//dashboard route
console.log('Registering dashboard routes...');
try {
  const dashboardRoutes = require('./routes/dashboardauth');
  app.use('/dashboard', dashboardRoutes);
  console.log('Dashboard routes registered successfully');
} catch (error) {
  console.error('Error loading dashboard routes:', error.message);
}

//loan review routes
app.use('/api/loan-review', require('./routes/loanReview'));

// membership applications routes
app.use('/api/membership-applications', require('./routes/memberApplications'));

// payment reference routes
app.use('/api/payments', require('./routes/payments'));
app.use('/api/user-management', require('./routes/userManagement'));

// invoice routes
app.use('/api/invoices', require('./routes/invoices'));

// member import routes
app.use('/api', require('./routes/importMembers'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Staff Portal Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    const pool = require('./db');
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Database connection successful',
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

// Debug: catch-all route to see what requests are not being handled
app.all('*', (req, res) => {
  console.log(`Unhandled request: ${req.method} ${req.path}`);
  console.log('Available routes should include /auth/login, /auth/is-verify');
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method, 
    path: req.path,
    message: 'This endpoint does not exist on the server'
  });
});

app.listen(PORT, () => {
  console.log(`Staff Portal server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 