const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware - FIXED TYPO
app.use(cors({
<<<<<<< HEAD
<<<<<<< HEAD
    origin: process.env.NODE_ENV === 'production'
    ? [
        'https://credit-coop-landing.onrender.com',
        'https://credit-coop-member-portal.onrender.com',
        'https://credit-coop-staff-portal.onrender.com'
    ]
=======
  origin: process.env.NODE_ENV === 'production'
=======
    origin: process.env.NODE_ENV === 'production'
>>>>>>> a8edf95 (Fix typo in CORS middleware setup)
    ? [
        'https://credit-coop-landing.onrender.com',
        'https://credit-coop-member-portal.onrender.com',
        'https://credit-coop-staff-portal.onrender.com'
<<<<<<< HEAD
      ]
>>>>>>> a1601c4 (Refactor CORS middleware configuration)
=======
    ]
>>>>>>> a8edf95 (Fix typo in CORS middleware setup)
    : [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004'
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a8edf95 (Fix typo in CORS middleware setup)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
<<<<<<< HEAD
=======
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
>>>>>>> a1601c4 (Refactor CORS middleware configuration)
=======
>>>>>>> a8edf95 (Fix typo in CORS middleware setup)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Backend API server is running',
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

// Basic API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Credit Cooperative Backend API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
