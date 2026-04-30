import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDB() {
  try {import express from 'express';
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

    // Connect without DB selected to create the DB first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'green_justice'}\`;`);
    console.log(`Database '${process.env.DB_NAME}' created or already exists.`);

    await connection.changeUser({ database: process.env.DB_NAME || 'green_justice' });

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    // Splitting by semicolon and filtering out empty queries
    const queries = sqlScript.split(';').filter(q => q.trim().length > 0);

    for (let query of queries) {
      if (query.trim()) {
         try {
             await connection.query(query);
         } catch (e) {
             console.error('Error executing query:', query.substring(0, 50) + '...', e.message);
         }
      }
    }
    
    console.log('Schema imported successfully!');
    await connection.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDB();
