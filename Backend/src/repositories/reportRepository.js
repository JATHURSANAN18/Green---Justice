import db from '../database/db.js';

class ReportRepository {
    async createComplaint(connection, user_id, violation_type, description) {
        const [result] = await connection.query(
            'INSERT INTO Complaints (user_id, violation_type, description, status, report_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [user_id || null, violation_type, description || '', 'Not Viewed']
        );
        return result.insertId;
    }

    async createLocation(connection, complaintId, location_name, longitude, latitude, district) {
        await connection.query(
            'INSERT INTO Locations (complaint_id, location_name, longitude, latitude, district) VALUES (?, ?, ?, ?, ?)',
            [complaintId, location_name || '', longitude, latitude, district || null]
        );
    }

    async createEvidence(connection, complaintId, file_type, file_url) {
        await connection.query(
            'INSERT INTO Evidences (complaint_id, file_type, file_url) VALUES (?, ?, ?)',
            [complaintId, file_type || 'image', file_url]
        );
    }

    async getComplaintStatusById(id) {
        const [rows] = await db.query('SELECT status FROM Complaints WHERE complaint_id = ?', [id]);
        return rows[0] || null;
    }

    async updateComplaintStatus(id, status) {
        const [result] = await db.query('UPDATE Complaints SET status = ? WHERE complaint_id = ?', [status, id]);
        return result.affectedRows > 0;
    }

    async createStatusUpdateHistory(id, authority_id, status, description) {
        await db.query(
            'INSERT INTO StatusUpdates (complaint_id, updated_by_authority_id, status, description, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [id, authority_id || null, status, description || 'Status changed']
        );
    }
}

export default new ReportRepository();

