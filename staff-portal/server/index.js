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
app.get('/reset-admin-password', async (req, res) => {
  try {
    const pool = require('./db');
    const bcrypt = require('bcrypt');
    
    const email = 'admin@creditcoop.com';
    const newPassword = 'password123';
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the admin user's password
    const result = await pool.query(
      "UPDATE users SET user_password = $1 WHERE user_email = $2 RETURNING user_id, user_name, user_email, user_role",
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    res.json({ 
      message: 'Admin password reset successfully!', 
      user: result.rows[0],
      credentials: { email: email, password: newPassword }
    });
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
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
    
    // Format response for frontend
    const userInfo = {
      id: user.rows[0].user_id,
      name: user.rows[0].user_name,
      email: user.rows[0].user_email,
      role: user.rows[0].user_role
    };
    
    res.json(userInfo);
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
    
    // Check if reset parameter is provided
    if (req.query.reset === 'passwords') {
      // Reset all passwords
      const bcrypt = require('bcrypt');
      const defaultPassword = 'password123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      // Get all users first
      const usersResult = await pool.query("SELECT user_id, user_email FROM users");
      const users = usersResult.rows;
      
      // Update all users with the new hashed password
      const updatePromises = users.map(user => 
        pool.query(
          "UPDATE users SET user_password = $1 WHERE user_id = $2",
          [hashedPassword, user.user_id]
        )
      );
      
      await Promise.all(updatePromises);
      
      return res.json({ 
        message: 'All user passwords have been reset successfully',
        defaultPassword: defaultPassword,
        updatedUsers: users.map(user => ({
          email: user.user_email,
          message: 'Password reset to: password123'
        })),
        count: users.length
      });
    }
    
    // Normal user listing
    const result = await pool.query("SELECT user_id, user_name, user_email, user_role FROM users ORDER BY user_id");
    res.json({ users: result.rows, count: result.rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: check membership applications
app.get('/debug/applications', async (req, res) => {
  try {
    const pool = require('./db');
    const result = await pool.query("SELECT * FROM membership_applications ORDER BY created_at DESC LIMIT 10");
    res.json({ 
      applications: result.rows, 
      count: result.rows.length,
      message: `Found ${result.rows.length} membership applications`
    });
  } catch (error) {
    res.status(500).json({ error: error.message, table: 'membership_applications' });
  }
});

// Test endpoint for membership applications (no auth required for debugging)
app.get('/test/membership-applications', async (req, res) => {
  try {
    const pool = require('./db');
    const result = await pool.query("SELECT * FROM membership_applications ORDER BY created_at DESC");
    res.json({
      success: true,
      applications: result.rows,
      count: result.rows.length,
      message: 'Test endpoint - no auth required'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message, 
      message: 'Failed to fetch applications' 
    });
  }
});

// Reset passwords via debug endpoint
app.get('/debug/reset-passwords', async (req, res) => {
  try {
    const pool = require('./db');
    
    // Get all users
    const usersResult = await pool.query("SELECT user_id, user_email FROM users");
    const users = usersResult.rows;
    
    if (users.length === 0) {
      return res.json({ message: 'No users found' });
    }
    
    const bcrypt = require('bcrypt');
    const defaultPassword = 'password123'; // Default password for all accounts
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Update all users with the new hashed password
    const updatePromises = users.map(user => 
      pool.query(
        "UPDATE users SET user_password = $1 WHERE user_id = $2",
        [hashedPassword, user.user_id]
      )
    );
    
    await Promise.all(updatePromises);
    
    const updatedUsers = users.map(user => ({
      email: user.user_email,
      message: 'Password reset to: password123'
    }));
    
    res.json({ 
      message: 'All user passwords have been reset successfully',
      defaultPassword: defaultPassword,
      updatedUsers: updatedUsers,
      count: users.length
    });
    
  } catch (error) {
    console.error('Error resetting all passwords:', error);
    res.status(500).json({ error: 'Failed to reset passwords', details: error.message });
  }
});

// Reset all user passwords endpoint
app.get('/reset-all-passwords', async (req, res) => {
  try {
    const pool = require('./db');
    
    // Get all users
    const usersResult = await pool.query("SELECT user_id, user_email FROM users");
    const users = usersResult.rows;
    
    if (users.length === 0) {
      return res.json({ message: 'No users found' });
    }
    
    const bcrypt = require('bcryptjs');
    const defaultPassword = 'password123'; // Default password for all accounts
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Update all users with the new hashed password
    const updatePromises = users.map(user => 
      pool.query(
        "UPDATE users SET user_password = $1 WHERE user_id = $2",
        [hashedPassword, user.user_id]
      )
    );
    
    await Promise.all(updatePromises);
    
    const updatedUsers = users.map(user => ({
      email: user.user_email,
      message: 'Password reset to: password123'
    }));
    
    res.json({ 
      message: 'All user passwords have been reset successfully',
      defaultPassword: defaultPassword,
      updatedUsers: updatedUsers,
      count: users.length
    });
    
  } catch (error) {
    console.error('Error resetting all passwords:', error);
    res.status(500).json({ error: 'Failed to reset passwords', details: error.message });
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