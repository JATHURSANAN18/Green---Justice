import db from '../database/db.js';

class AuthorityRepository {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM Authorities WHERE email = ?', [email]);
        return rows[0] || null;
    }

    async createAuthority(name, email, password_hash, region) {
        const [result] = await db.query(
            'INSERT INTO Authorities (name, email, password_hash, region) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, region]
        );
        return result.insertId;
    }

    async findByEmailAndPassword(email, password) {
        const [rows] = await db.query('SELECT * FROM Authorities WHERE email = ? AND password_hash = ?', [email, password]);
        return rows[0] || null;
    }

    async updateLastActive(authorityId) {
        await db.query('UPDATE Authorities SET last_active = CURRENT_TIMESTAMP WHERE authority_id = ?', [authorityId]);
    }

    async getComplaintCount(district) {
        let query = 'SELECT COUNT(c.complaint_id) as count FROM Complaints c LEFT JOIN Locations l ON c.complaint_id = l.complaint_id';
        const params = [];
        if (district) {
            query += ' WHERE l.district = ?';
            params.push(district);
        }
        const [total] = await db.query(query, params);
        return total[0].count;
    }
    
    async getResolvedComplaintCount(district) {
        let query = 'SELECT COUNT(c.complaint_id) as count FROM Complaints c LEFT JOIN Locations l ON c.complaint_id = l.complaint_id WHERE c.status = "Resolved"';
        const params = [];
        if (district) {
            query += ' AND l.district = ?';
            params.push(district);
        }
        const [resolved] = await db.query(query, params);
        return resolved[0].count;
    }

    async getPendingComplaintCount(district) {
        let query = 'SELECT COUNT(c.complaint_id) as count FROM Complaints c LEFT JOIN Locations l ON c.complaint_id = l.complaint_id WHERE c.status != "Resolved"';
        const params = [];
        if (district) {
            query += ' AND l.district = ?';
            params.push(district);
        }
        const [pending] = await db.query(query, params);
        return pending[0].count;
    }

    async getAllComplaintsForAuthority(district) {
        let query = `
            SELECT 
                c.complaint_id, c.violation_type, c.description, c.status, c.report_date,
                l.location_name, l.latitude, l.longitude, l.district,
                e.file_type, e.file_url 
            FROM Complaints c
            LEFT JOIN Locations l ON c.complaint_id = l.complaint_id
            LEFT JOIN Evidences e ON c.complaint_id = e.complaint_id
        `;
        const params = [];
        if (district) {
            query += ' WHERE l.district = ?';
            params.push(district);
        }
        query += ' ORDER BY c.report_date DESC';
        const [rows] = await db.query(query, params);
        return rows;
    }

    async deleteComplaint(id) {
        const [result] = await db.query('DELETE FROM Complaints WHERE complaint_id = ?', [id]);
        return result.affectedRows > 0;
    }
}

export default new AuthorityRepository();

