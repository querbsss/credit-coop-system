const express = require('express');
const app = express();
const cors = require('cors');

//middlewares
app.use(express.json());
app.use(cors());

// Add request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, { body: req.body });
  next();
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Member Portal API is running', timestamp: new Date().toISOString() });
});

// Simple login endpoint for testing
app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔍 Login attempt:', req.body);
    const { memberNumber, password } = req.body;
    
    // For now, just check if credentials match our demo user
    if (memberNumber === 'member@creditcoop.com' && password === 'password123') {
      const token = 'demo-jwt-token-' + Date.now();
      console.log('✅ Login successful');
      res.json({ 
        token, 
        user: { 
          user_id: 1, 
          user_name: 'Demo Member', 
          user_email: 'member@creditcoop.com' 
        } 
      });
    } else {
      console.log('❌ Invalid credentials');
      res.status(400).send('Invalid credentials');
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).send('Server Error');
  }
});

// Token verification endpoint
app.get('/auth/is-verify', (req, res) => {
  const token = req.headers.token;
  if (token && token.startsWith('demo-jwt-token-')) {
    res.json(true);
  } else {
    res.status(401).json(false);
  }
});

app.listen(5001, () => {
  console.log('✅ Server is running on port 5001');
});