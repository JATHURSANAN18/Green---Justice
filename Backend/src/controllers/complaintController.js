import db from '../database/db.js';

export const submitComplaint = async (req, res) => {
    try {
        const { user_id, violation_type, description, location_name, longitude, latitude, file_type, file_url } = req.body;

        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Insert Complaint
            const [complaintResult] = await connection.query(
                'INSERT INTO Complaints (user_id, violation_type, description, status, report_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [user_id || null, violation_type, description || '', 'Not Viewed']
            );
            const complaintId = complaintResult.insertId;

            // Insert Location
            if (longitude && latitude) {
                await connection.query(
                    'INSERT INTO Locations (complaint_id, location_name, longitude, latitude) VALUES (?, ?, ?, ?)',
                    [complaintId, location_name || '', longitude, latitude]
                );
            }

            // Insert Evidence
            if (file_url) {
                await connection.query(
                    'INSERT INTO Evidences (complaint_id, file_type, file_url) VALUES (?, ?, ?)',
                    [complaintId, file_type || 'image', file_url]
                );
            }

            // Commit transaction
            await connection.commit();
            
            res.status(201).json({ 
                message: 'Complaint submitted successfully', 
                complaint_id: complaintId 
            });
        } catch (error) {
            await connection.rollback();
            console.error('Error in complaint transaction:', error.message);
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Failed to submit complaint:', error.message);
        res.status(500).json({ error: 'Failed to submit complaint: ' + error.message });
    }
};

export const getComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT status FROM Complaints WHERE complaint_id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.status(200).json({ status: rows[0].status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch status' });
    }
};

export const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, authority_id, description } = req.body;

        // Update complaint
        await db.query('UPDATE Complaints SET status = ? WHERE complaint_id = ?', [status, id]);

        // Insert status update history
        await db.query(
            'INSERT INTO StatusUpdates (complaint_id, updated_by_authority_id, status, description, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [id, authority_id, status, description || 'Status changed']
        );

        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update complaint status' });
    }
};
