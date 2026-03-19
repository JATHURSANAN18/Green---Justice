const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory session store (for demo purposes)
const sessions = new Map();

// File uploads (photos/videos)
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend & uploaded files
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Helper functions ---
function createSession(authority) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, {
    id: authority.id,
    name: authority.name,
    email: authority.email,
  });
  return token;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const token = authHeader.substring('Bearer '.length);
  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ message: 'Invalid session' });
  }
  req.authority = session;
  next();
}

// --- Auth routes (authorities) ---
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare(
    'INSERT INTO authorities (name, email, password_hash) VALUES (?, ?, ?)'
  );
  stmt.run(name, email, passwordHash, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'Email is already registered' });
      }
      console.error(err);
      return res.status(500).json({ message: 'Error creating account' });
    }
    const authority = { id: this.lastID, name, email };
    const token = createSession(authority);
    res.json({ token, authority });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.get(
    'SELECT * FROM authorities WHERE email = ?',
    [email],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error logging in' });
      }
      if (!row) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const isValid = bcrypt.compareSync(password, row.password_hash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const authority = { id: row.id, name: row.name, email: row.email };
      const token = createSession(authority);
      res.json({ token, authority });
    }
  );
});

// --- Complaint submission (users) ---
app.post(
  '/api/complaints',
  upload.single('media'),
  (req, res) => {
    const { violation_type, language, description, location } = req.body;
    if (!violation_type || !location) {
      return res
        .status(400)
        .json({ message: 'Violation type and location are required' });
    }

    const mediaFilename = req.file ? req.file.filename : null;

    const stmt = db.prepare(
      `INSERT INTO complaints
       (violation_type, language, description, location, media_filename)
       VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(
      violation_type,
      language || null,
      description || null,
      location,
      mediaFilename,
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error saving complaint' });
        }
        db.get(
          'SELECT * FROM complaints WHERE id = ?',
          [this.lastID],
          (err2, row) => {
            if (err2) {
              console.error(err2);
              return res
                .status(500)
                .json({ message: 'Error retrieving saved complaint' });
            }
            res.status(201).json({
              message:
                'Thank you for helping to keep the environment clean. Your report has been received.',
              complaint: row,
            });
          }
        );
      }
    );
  }
);

// --- Public complaint status lookup (users) ---
app.get('/api/public/complaints/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    `
      SELECT id, violation_type, status, created_at, updated_at
      FROM complaints
      WHERE id = ? AND status != 'deleted'
    `,
    [id],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error loading status' });
      }
      if (!row) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(row);
    }
  );
});

// --- Complaint listing & sorting (authorities) ---
app.get('/api/complaints', authMiddleware, (req, res) => {
  const sort = req.query.sort || 'recent';
  let orderBy = 'created_at DESC';

  if (sort === 'highly-reported') {
    orderBy = 'reports_count DESC, created_at DESC';
  } else if (sort === 'oldest') {
    orderBy = 'created_at ASC';
  } else if (sort === 'oldest-open') {
    orderBy = `
      CASE WHEN status = 'open' THEN 0 ELSE 1 END,
      created_at ASC
    `;
  }

  db.all(
    `SELECT * FROM complaints
     WHERE status != 'deleted'
     ORDER BY ${orderBy}`,
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error loading complaints' });
      }
      res.json({ complaints: rows });
    }
  );
});

// --- Mark complaint as viewed (authorities) ---
app.patch('/api/complaints/:id/viewed', authMiddleware, (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare(
    `
      UPDATE complaints
      SET viewed_at = COALESCE(viewed_at, CURRENT_TIMESTAMP),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status != 'deleted'
    `
  );
  stmt.run(id, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error updating viewed status' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Marked as viewed' });
  });
});

// --- Update complaint status ---
app.patch('/api/complaints/:id/status', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const allowed = new Set(['open', 'in_progress', 'resolved', 'deleted']);
  if (!allowed.has(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const stmt = db.prepare(
    `UPDATE complaints
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  );
  stmt.run(status, id, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error updating status' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Status updated' });
  });
});

// --- Delete fake complaint ---
app.delete('/api/complaints/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare(
    `UPDATE complaints
     SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  );
  stmt.run(id, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error deleting complaint' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted as fake allegation' });
  });
});

// --- Get office info for a violation type ---
app.get('/api/offices', authMiddleware, (req, res) => {
  const { violation_type } = req.query;
  if (!violation_type) {
    return res.status(400).json({ message: 'violation_type is required' });
  }

  db.get(
    'SELECT * FROM offices WHERE violation_type = ?',
    [violation_type],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error loading office info' });
      }
      if (!row) {
        return res
          .status(404)
          .json({ message: 'No office configured for this violation type' });
      }
      res.json({ office: row });
    }
  );
});

// --- Simple reminder check (complaints older than a week) ---
function checkReminders() {
  // In a real system, use cron; here we log and flag reminders.
  db.all(
    `
      SELECT * FROM complaints
      WHERE status != 'resolved'
        AND status != 'deleted'
        AND reminder_sent = 0
        AND created_at <= datetime('now', '-7 days')
    `,
    (err, rows) => {
      if (err) {
        console.error('Error checking reminders', err);
        return;
      }
      if (!rows || rows.length === 0) return;

      console.log(
        `Reminder: ${rows.length} complaint(s) have not been addressed for at least a week.`
      );
      const ids = rows.map((r) => r.id);
      const placeholders = ids.map(() => '?').join(',');
      db.run(
        `UPDATE complaints SET reminder_sent = 1 WHERE id IN (${placeholders})`,
        ids,
        (err2) => {
          if (err2) {
            console.error('Error marking reminders sent', err2);
          }
        }
      );
    }
  );
}

// Run reminder check every hour
setInterval(checkReminders, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Green Justice server running on http://localhost:${PORT}`);
});

