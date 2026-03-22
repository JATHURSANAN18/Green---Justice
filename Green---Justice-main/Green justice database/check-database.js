const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'green_justice'
    };

    const connection = await mysql.createConnection(dbConfig);

    // Check departments
    const [departments] = await connection.query('SELECT * FROM departments');
    console.log(`📍 Departments: ${departments.length} found`);
    departments.forEach(d => console.log(`   - ${d.name}`));

    // Check violation types
    const [violations] = await connection.query('SELECT * FROM violation_types');
    console.log(`\n🚨 Violation Types: ${violations.length} found`);
    violations.forEach(v => console.log(`   - ${v.name} (dept: ${v.department_id})`));

    // Check authorities
    const [authorities] = await connection.query('SELECT id, username, name FROM authorities');
    console.log(`\n👤 Authorities: ${authorities.length} found`);
    authorities.forEach(a => console.log(`   - ${a.username} (${a.name})`));

    await connection.end();

    if (violations.length === 0) {
      console.log('\n⚠️  No violation types found! Try running seed-database.js again');
    } else {
      console.log('\n✅ Database looks good!');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkDatabase();
