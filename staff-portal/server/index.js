const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json()); //req body
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://credit-coop-staff-portal.onrender.com', 'https://credit-coop-landing.onrender.com', 'https://credit-coop-member-portal.onrender.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

//ROUTES

//register and login routes

app.use('/auth', require('./routes/coopauth'));

//dashboard route
app.use('/dashboard', require('./routes/dashboardauth'));

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

app.listen(PORT, () => {
  console.log(`Staff Portal server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 