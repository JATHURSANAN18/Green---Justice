const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up Green Justice Database...\n');

    // Read environment variables
    require('dotenv').config();

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    };

    // Connect to MySQL (without database)
    console.log(`📡 Connecting to MySQL at ${dbConfig.host}...`);
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('📋 Loading database schema...');
    await connection.query(schema);
    console.log('✅ Database schema loaded successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES FROM green_justice');
    console.log(`✅ Created ${tables.length} tables:\n`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table['Tables_in_green_justice']}`);
    });

    // Close connection
    await connection.end();
    console.log('\n✅ Database setup complete! Ready to run the application.\n');
    console.log('📌 Next steps:');
    console.log('  1. Start backend: npm run dev');
    console.log('  2. Start frontend: npm start');
    console.log('  3. Visit: http://localhost:3000\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('  1. MySQL is running');
    console.log('  2. .env file is configured with correct DB credentials');
    console.log('  3. DB_HOST, DB_USER, DB_PASSWORD are correct\n');
    process.exit(1);
  }
}

setupDatabase();
