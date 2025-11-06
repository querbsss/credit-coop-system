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

// Test route first - simple route without dependencies
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Simple auth routes first (always available)
app.post('/auth/login', async (req, res) => {
  try {
    const pool = require('./db');
    const bcrypt = require('bcrypt');
    const jwtgenerator = require('./utils/jwtgenerator');
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(401).json({ error: "All fields are required" });
    }
    
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].user_password);
    
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwtgenerator(user.rows[0].user_id, user.rows[0].user_role);
    const userInfo = {
      id: user.rows[0].user_id,
      name: user.rows[0].user_name,
      email: user.rows[0].user_email,
      role: user.rows[0].user_role
    };
    
    res.json({ token, user: userInfo });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/auth/is-verify', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Not authorized");
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.jwt_secret || 'default_jwt_secret_for_development_only_change_in_production';
    const payload = jwt.verify(jwtToken, jwtSecret);
    
    res.json(true);
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(403).json("Not authorized");
  }
});

app.get('/auth/profile', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const pool = require('./db');
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Not authorized");
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.jwt_secret || 'default_jwt_secret_for_development_only_change_in_production';
    const payload = jwt.verify(jwtToken, jwtSecret);
    
    const user = await pool.query("SELECT user_id, user_name, user_email, user_role FROM users WHERE user_id = $1", [payload.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json("User not found");
    }
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error('Profile error:', err.message);
    return res.status(403).json("Not authorized");
  }
});

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