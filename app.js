const express = require('express')
const mongoose = require('mongoose');

const dotenv = require('dotenv');

const app = express()
const port = process.env.PORT || 3000

// Set up Global configuration access
dotenv.config();

let user_router = require('./user');
let emp_router = require('./emp');
 
app.use('/api/v1/user', user_router);
app.use('/api/v1/emp', emp_router);

app.get('/', (req, res) => {
  res.send('API Endpoints of A1')
})

mongoose.connect('mongodb://localhost:27017/comp3123_assigment1')

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
