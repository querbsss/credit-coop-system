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

// Simple password reset for admin (temporary)
// Password reset endpoint for admin user
app.get('/reset-admin-password', async (req, res) => {
  try {
    const pool = require('./db');
    const bcrypt = require('bcrypt');
    
    // Hash the password with same salt rounds as login
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    
    // Update admin user password
    const updateQuery = `
      UPDATE users 
      SET password = $1 
      WHERE email = 'admin@creditcoop.com'
    `;
    
    const result = await pool.query(updateQuery, [hashedPassword]);
    
    if (result.rowCount > 0) {
      res.json({ 
        success: true, 
        message: 'Admin password reset successfully. You can now login with admin@creditcoop.com / password123' 
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Admin user not found in database' 
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Check what users exist in the database
app.get('/check-users', async (req, res) => {
  try {
    const pool = require('./db');
    
    const query = 'SELECT id, email, name, role FROM users ORDER BY email';
    const result = await pool.query(query);
    
    res.json({ 
      success: true, 
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Check users error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Reset itadmin password
app.get('/reset-itadmin-password', async (req, res) => {
  try {
    const pool = require('./db');
    const bcrypt = require('bcrypt');
    
    // Hash the password with same salt rounds as login
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    
    // Update itadmin user password
    const updateQuery = `
      UPDATE users 
      SET password = $1 
      WHERE email = 'itadmin@creditcoop.com' OR email = 'itadmin'
    `;
    
    const result = await pool.query(updateQuery, [hashedPassword]);
    
    if (result.rowCount > 0) {
      res.json({ 
        success: true, 
        message: 'ITAdmin password reset successfully. You can now login with itadmin@creditcoop.com / password123' 
      });
    } else {
      res.json({ 
        success: false, 
        message: 'ITAdmin user not found in database' 
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
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

// Temporary endpoint to create a test user (for setup only)
app.post('/setup/create-admin', async (req, res) => {
  try {
    const pool = require('./db');
    const bcrypt = require('bcrypt');
    
    const email = 'admin@creditcoop.com';
    const password = 'password123';
    const name = 'Admin User';
    const role = 'admin';
    
    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
    
    if (existingUser.rows.length > 0) {
      return res.json({ message: 'Admin user already exists', email: email });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const result = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password, user_role) VALUES ($1, $2, $3, $4) RETURNING user_id, user_name, user_email, user_role",
      [name, email, hashedPassword, role]
    );
    
    res.json({ 
      message: 'Admin user created successfully!', 
      user: result.rows[0],
      credentials: { email: email, password: password }
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user', details: error.message });
  }
});

// Debug: check what users exist
app.get('/debug/users', async (req, res) => {
  try {
    const pool = require('./db');
    const result = await pool.query("SELECT user_id, user_name, user_email, user_role FROM users ORDER BY user_id");
    res.json({ users: result.rows, count: result.rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
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