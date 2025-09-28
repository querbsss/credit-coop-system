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

app.listen(5000, () => {
  console.log('Server is running on port 5000');
}); 