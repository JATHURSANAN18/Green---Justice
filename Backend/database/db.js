import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Build connection configuration supporting connection URLs (Railway/Render) and individual variables
const connectionConfig = (process.env.MYSQL_URL || process.env.DATABASE_URL)
  ? (process.env.MYSQL_URL || process.env.DATABASE_URL)
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Abish@07',
      database: process.env.DB_NAME || 'green_justice',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      ssl: (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true') ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      max_allowed_packet: 16 * 1024 * 1024
    };

const pool = mysql.createPool(connectionConfig);

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'green_justice'));
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database', err.message);
  });

export default pool;
