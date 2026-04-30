import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database/db.js';

// Import Routes
import userRoutes from './routes/userRoutes.js';
import authorityRoutes from './routes/authorityRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic Route
app.get('/', (req, res) => {
  res.send('Welcome to Green Justice API');
});

// Modular Routes
app.use('/api/users', userRoutes);
app.use('/api/authorities', authorityRoutes);
app.use('/api/complaints', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
