import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDB() {
  try {
    let connection;
    const connStr = process.env.MYSQL_URL || process.env.DATABASE_URL;

    if (connStr) {
      connection = await mysql.createConnection(connStr);
    } else {
      try {
        // Try connecting without db to create if needed
        connection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'green_justice'}\`;`);
        await connection.changeUser({ database: process.env.DB_NAME || 'green_justice' });
      } catch (err) {
        // If connecting without db fails, connect directly with database
        connection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'green_justice',
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
          ssl: (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true') ? { rejectUnauthorized: false } : undefined
        });
      }
    }

    console.log('Connected to MySQL server.');

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
             console.error('Query notice/error:', query.substring(0, 40) + '...', e.message);
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
