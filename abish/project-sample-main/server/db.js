const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'green-justice.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Authorities (accounts that can log in)
  db.run(`
    CREATE TABLE IF NOT EXISTS authorities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Offices / councils / departments
  db.run(`
    CREATE TABLE IF NOT EXISTS offices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      violation_type TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      email TEXT
    )
  `);

  // Complaints / reports
  db.run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      violation_type TEXT NOT NULL,
      language TEXT,
      description TEXT,
      location TEXT,
      media_filename TEXT,
      status TEXT DEFAULT 'open', -- open | in_progress | resolved | deleted
      reports_count INTEGER DEFAULT 1,
      viewed_at DATETIME,
      reminder_sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed a few sample offices if table is empty
  db.get('SELECT COUNT(*) as count FROM offices', (err, row) => {
    if (err) return;
    if (row && row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO offices (violation_type, name, phone, address, email)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        'illegal-dumping',
        'City Waste Management Department',
        '+1 (555) 123-4567',
        '123 Green St, Eco City',
        'waste@ecocity.gov'
      );
      stmt.run(
        'water-pollution',
        'River & Water Quality Council',
        '+1 (555) 555-9876',
        '45 Riverbank Rd, Eco City',
        'water@ecocity.gov'
      );
      stmt.run(
        'air-pollution',
        'Air Quality and Emissions Office',
        '+1 (555) 999-0000',
        '78 Skyview Ave, Eco City',
        'air@ecocity.gov'
      );
      stmt.finalize();
    }
  });
});

module.exports = db;

