const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('Green Justice Backend API is running on MySQL');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);

// Initialize Cron Jobs
require('./utils/cronJobs');

// Database Connection
sequelize.sync({ alter: true })
  .then(() => console.log('MySQL connected and matched models'))
  .catch((err) => console.error('MySQL connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
