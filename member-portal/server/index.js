const express = require('express');
const app = express();
const cors = require('cors');

//middlewares
app.use(express.json());

app.use(cors());

//routes

//login route
app.use('/auth', require('./routes/coopauth'));

app.use('/dashboard', require('./routes/dashboard'));

app.listen(5001, () => {
  console.log('Server is running on port 5001');
});