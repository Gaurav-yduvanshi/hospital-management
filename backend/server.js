const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://inspiring-pegasus-fdf9d3.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch((err) => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/admin', require('./routes/admin'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Hospital Management API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
