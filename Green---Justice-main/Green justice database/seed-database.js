const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding Green Justice Database with sample data...\n');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'green_justice',
      multipleStatements: true
    };

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Insert departments
    console.log('📝 Adding departments...');
    await connection.query(`
      INSERT INTO departments (name, description, address, phone, email, contact_person) VALUES
      ('Environmental Protection Agency', 'Main environmental agency', '123 Green Street', '+1-800-555-0001', 'contact@epa.gov', 'John Smith'),
      ('Water Quality Department', 'Water pollution control', '456 Water Lane', '+1-800-555-0002', 'water@example.gov', 'Jane Doe'),
      ('Air Quality Division', 'Air pollution management', '789 Air Avenue', '+1-800-555-0003', 'air@example.gov', 'Bob Wilson'),
      ('Waste Management', 'Illegal dumping and waste', '321 Trash Road', '+1-800-555-0004', 'waste@example.gov', 'Alice Brown'),
      ('Forest Conservation', 'Deforestation and tree protection', '654 Tree Lane', '+1-800-555-0005', 'forest@example.gov', 'David Green')
    `);
    console.log('✅ Departments added\n');

    // Insert violation types
    console.log('📝 Adding violation types...');
    await connection.query(`
      INSERT INTO violation_types (name, description, severity, department_id) VALUES
      ('Air Pollution', 'Illegal emission of harmful gases and particulates', 'critical', 3),
      ('Water Pollution', 'Contamination of water bodies and water systems', 'critical', 2),
      ('Illegal Dumping', 'Unauthorized waste disposal in restricted areas', 'high', 4),
      ('Deforestation', 'Unauthorized tree removal and forest clearing', 'high', 5),
      ('Noise Pollution', 'Excessive noise levels exceeding legal limits', 'medium', 1),
      ('Chemical Spill', 'Release of hazardous chemicals into environment', 'critical', 1),
      ('Soil Contamination', 'Pollution of soil with harmful substances', 'high', 1),
      ('Factory Emissions', 'Industrial discharge without proper permits', 'critical', 3),
      ('Littering', 'Improper disposal of waste in public areas', 'low', 4),
      ('Unauthorized Construction', 'Building in protected environmental zones', 'high', 1)
    `);
    console.log('✅ Violation types added\n');

    // Map violations to departments
    console.log('📝 Mapping violations to departments...');
    await connection.query(`
      INSERT INTO violation_department_mapping (violation_type_id, department_id, priority) VALUES
      (1, 3, 1),  -- Air pollution -> Air Quality Division
      (2, 2, 1),  -- Water pollution -> Water Quality Department
      (3, 4, 1),  -- Illegal dumping -> Waste Management
      (4, 5, 1),  -- Deforestation -> Forest Conservation
      (5, 1, 2),  -- Noise pollution -> EPA
      (6, 1, 1),  -- Chemical spill -> EPA
      (7, 1, 2),  -- Soil contamination -> EPA
      (8, 3, 1),  -- Factory emissions -> Air Quality
      (9, 4, 2),  -- Littering -> Waste Management
      (10, 1, 1)  -- Unauthorized construction -> EPA
    `);
    console.log('✅ Violation mappings added\n');

    // Insert test authority (password: greenworld123 hashed with bcrypt)
    console.log('📝 Adding test authority...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('greenworld123', 10);
    
    await connection.query(`
      INSERT INTO authorities (username, password, email, name, phone, department_id, role, is_active) VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['authority1', hashedPassword, 'authority1@example.gov', 'Officer John Smith', '+1-800-555-0100', 1, 'authority', true]);
    
    console.log('✅ Test authority added\n');
    console.log('   📌 Login credentials:');
    console.log('      Username: authority1');
    console.log('      Password: greenworld123\n');

    await connection.end();

    console.log('✅ Database seeding complete!\n');
    console.log('📌 You can now:');
    console.log('  1. Report violations (10 types available)');
    console.log('  2. Login as authority: authority1 / greenworld123');
    console.log('  3. View complaints on the authority dashboard\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
