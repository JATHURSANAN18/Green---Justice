const pool = require('./config/database');

async function checkCount() {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'SELECT COUNT(*) as resolvedCount FROM complaints WHERE status = "resolved"'
    );
    console.log('Resolved Count:', result[0].resolvedCount);
    
    if (result[0].resolvedCount === 0) {
        console.log('Inserting a dummy resolved complaint for testing...');
        // Insert a dummy user if none exists
        let [users] = await connection.query('SELECT id FROM users LIMIT 1');
        let userId;
        if (users.length === 0) {
            const [userRes] = await connection.query('INSERT INTO users (name, email) VALUES (?, ?)', ['Test User', 'test@example.com']);
            userId = userRes.insertId;
        } else {
            userId = users[0].id;
        }
        
        // Insert a dummy violation type if none exists
        let [vTypes] = await connection.query('SELECT id FROM violation_types LIMIT 1');
        let vTypeId;
        if (vTypes.length === 0) {
            const [vRes] = await connection.query('INSERT INTO (name, description, department_id) VALUES (?, ?, ?)', ['Noise Pollution', 'Too much noise', 1]);
            vTypeId = vRes.insertId;
        } else {
            vTypeId = vTypes[0].id;
        }

        await connection.query(
            'INSERT INTO complaints (user_id, violation_type_id, title, description, location_address, status, resolved_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [userId, vTypeId, 'Test Complaint', 'This is a test', '123 test st', 'resolved']
        );
        console.log('Inserted dummy resolved complaint.');
    }
    
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCount();
