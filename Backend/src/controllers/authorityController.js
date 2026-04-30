import db from '../database/db.js';

const SRI_LANKAN_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
    'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export const registerAuthority = async (req, res) => {
    try {
        const { name, email, password, region } = req.body;
        
        if (!name || !email || !password || !region) {
            return res.status(400).json({ error: 'All fields are required, including district' });
        }

        if (!SRI_LANKAN_DISTRICTS.includes(region)) {
            return res.status(400).json({ error: 'Invalid Sri Lankan district selected' });
        }

        const [existing] = await db.query('SELECT * FROM Authorities WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // In a real application, hash the password here.
        const [result] = await db.query(
            'INSERT INTO Authorities (name, email, password_hash, region) VALUES (?, ?, ?, ?)',
            [name, email, password, region]
        );

        res.status(201).json({ message: 'Authority registered successfully', authority_id: result.insertId });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ error: 'Failed to register authority: ' + error.message });
    }
};

export const loginAuthority = async (req, res) => {
    try {
        const { email, password } = req.body;
        // In a real application, implement proper password hashing comparison
        const [rows] = await db.query('SELECT * FROM Authorities WHERE email = ? AND password_hash = ?', [email, password]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last active
        await db.query('UPDATE Authorities SET last_active = CURRENT_TIMESTAMP WHERE authority_id = ?', [rows[0].authority_id]);

        res.status(200).json({ message: 'Login successful', token: 'mock-jwt-token', authority: rows[0] });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Authentication failed: ' + error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const [total] = await db.query('SELECT COUNT(*) as count FROM Complaints');
        const [resolved] = await db.query('SELECT COUNT(*) as count FROM Complaints WHERE status = "Resolved"');
        const [pending] = await db.query('SELECT COUNT(*) as count FROM Complaints WHERE status != "Resolved"');

        res.status(200).json({
            total: total[0].count,
            resolved: resolved[0].count,
            pending: pending[0].count
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getComplaints = async (req, res) => {
    try {
        const { district } = req.query;
        let query = `
            SELECT 
                c.complaint_id, c.violation_type, c.description, c.status, c.report_date,
                l.location_name, l.latitude, l.longitude, l.district,
                e.file_type, e.file_url 
            FROM Complaints c
            LEFT JOIN Locations l ON c.complaint_id = l.complaint_id
            LEFT JOIN Evidences e ON c.complaint_id = e.complaint_id
        `;
        
        const queryParams = [];
        // For now, show all complaints - remove district filter
        // if (district) {
        //     query += ` WHERE l.district = ?`;
        //     queryParams.push(district);
        // }
        
        query += ` ORDER BY c.report_date DESC`;

        const [rows] = await db.query(query, queryParams);

        // Group rows by complaint_id
        const complaintsMap = rows.reduce((acc, row) => {
            const id = row.complaint_id;
            if (!acc[id]) {
                acc[id] = {
                    id: id,
                    complaint_id: id,
                    categoryLabel: row.violation_type,
                    description: row.description,
                    status: row.status,
                    createdAt: row.report_date,
                    locationName: row.location_name,
                    latitude: row.latitude ? parseFloat(row.latitude) : null,
                    longitude: row.longitude ? parseFloat(row.longitude) : null,
                    mediaFiles: []
                };
            }
            if (row.file_url) {
                // Check if this evidence is already added (in case of multiple joins)
                const alreadyExists = acc[id].mediaFiles.some(m => m.data === row.file_url);
                if (!alreadyExists) {
                    acc[id].mediaFiles.push({
                        type: row.file_type || 'image/jpeg',
                        data: row.file_url
                    });
                }
            }
            return acc;
        }, {});

        res.status(200).json(Object.values(complaintsMap));
    } catch (error) {
        console.error('Failed to fetch complaints:', error.message);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

export const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Backend: Attempting to delete complaint_id: ${id}`);
        
        const [result] = await db.query('DELETE FROM Complaints WHERE complaint_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            console.log(`Backend: No complaint found with ID: ${id}`);
            return res.status(404).json({ error: 'Complaint not found' });
        }

        console.log(`Backend: Successfully deleted complaint_id: ${id}`);
        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error.message);
        res.status(500).json({ error: 'Failed to delete complaint: ' + error.message });
    }
};
