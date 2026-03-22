const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDB() {
  const uri = 'mysql://F7bMxV3zdC4k2es.root:17mnQdrwh65mcxkV@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test';
  
  console.log('Connecting to database...');
  try {
    const connection = await mysql.createConnection({
      uri: uri,
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: true
      }
    });

    console.log('Connected! Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await connection.query(sql);
    
    console.log('Database initialized successfully!');
    await connection.end();
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initDB();
