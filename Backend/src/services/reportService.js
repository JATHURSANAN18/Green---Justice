import db from '../database/db.js';
import reportRepository from '../repositories/reportRepository.js';

class ReportService {
    async sumbitReportData(payload) {
        const { user_id, violation_type, description, location_name, longitude, latitude, district, file_type, file_url } = payload;
        
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const complaintId = await reportRepository.createComplaint(connection, user_id, violation_type, description);

            if (longitude && latitude) {
                await reportRepository.createLocation(connection, complaintId, location_name, longitude, latitude, district);
            }

            if (file_url) {
                await reportRepository.createEvidence(connection, complaintId, file_type, file_url);
            }

            await connection.commit();
            return complaintId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getStatus(id) {
        const complaint = await reportRepository.getComplaintStatusById(id);
        if (!complaint) {
            throw new Error('Complaint not found');
        }
        return complaint.status;
    }

    async updateStatus(id, status, authority_id, description) {
        const isUpdated = await reportRepository.updateComplaintStatus(id, status);
        if (!isUpdated) {
            throw new Error('Complaint not found');
        }

        await reportRepository.createStatusUpdateHistory(id, authority_id, status, description);
        return true;
    }
}

export default new ReportService();
