const express = require('express');
const app = express();
const cors = require('cors');

//middleware
app.use(express.json()); //req body
app.use(cors());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
