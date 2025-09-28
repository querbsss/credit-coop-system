const express = require('express');
const app = express();
const cors = require('cors');

console.log('Starting server...');

//middlewares
app.use(express.json());
app.use(cors());

console.log('Middleware configured...');

// Test endpoint
app.get('/', (req, res) => {
  console.log('GET / request received');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Simple login endpoint
app.post('/auth/login', (req, res) => {
  console.log('POST /auth/login request received:', req.body);
  
  const { memberNumber, password } = req.body;
  
  if (memberNumber === 'member@creditcoop.com' && password === 'password123') {
    console.log('Login successful');
    const token = 'demo-jwt-token-' + Date.now();
    res.json({ 
      token, 
      user: { 
        user_id: 1, 
        user_name: 'Demo Member', 
        user_email: 'member@creditcoop.com' 
      } 
    });
  } else {
    console.log('Login failed');
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

const PORT = 3002;
console.log(`Attempting to start server on port ${PORT}...`);

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`Test at: http://localhost:${PORT}/`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});