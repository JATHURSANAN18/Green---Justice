const pool = require('./config/database');

async function migrate() {
  try {
    const connection = await pool.getConnection();
    
    console.log('Altering users table...');
    await connection.query('ALTER TABLE users MODIFY email VARCHAR(100) NULL');
    
    console.log('Altering complaints table...');
    await connection.query('ALTER TABLE complaints MODIFY description TEXT NULL');
    
    console.log('Migration successful!');
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
