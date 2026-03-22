const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
  const uri = 'mysql://F7bMxV3zdC4k2es.root:17mnQdrwh65mcxkV@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test';
  
  console.log('Connecting to TiDB Cloud for setup...');
  try {
    const connection = await mysql.createConnection({
      uri: uri,
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('Connected!');

    const schemaPath = path.join(__dirname, '../Green justice database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Reading schema.sql...');
      let schema = fs.readFileSync(schemaPath, 'utf8');
      
      // The schema.sql has "CREATE DATABASE IF NOT EXISTS green_justice; USE green_justice;"
      // We are connecting to the "test" database in the URI. 
      // We should probably remove those or let them run if TiDB allows.
      // Usually TiDB allows multiple databases if the user has permissions.
      
      console.log('Executing schema...');
      await connection.query(schema);
      console.log('SUCCESS: Schema executed!');
      
      const [tables] = await connection.query('SHOW TABLES FROM green_justice');
      console.log('Tables in green_justice:', tables.map(t => Object.values(t)[0]));
    } else {
      console.log('ERROR: schema.sql not found at', schemaPath);
    }
    
    await connection.end();
  } catch (err) {
    console.error('ERROR during setup:', err.message);
    if (err.stack) console.error(err.stack);
  }
}
setup();
