import reportService from '../services/reportService.js';

export const submitComplaint = async (req, res) => {
    try {
        const complaintId = await reportService.sumbitReportData(req.body);
        res.status(201).json({ 
            message: 'Complaint submitted successfully', 
            complaint_id: complaintId 
        });
    } catch (error) {
        console.error('Failed to submit complaint:', error.message);
        res.status(500).json({ error: 'Failed to submit complaint: ' + error.message });
    }
};

export const getComplaintStatus = async (req, res) => {
    try {
        const status = await reportService.getStatus(req.params.id);
        res.status(200).json({ status });
    } catch (error) {
        if (error.message === 'Complaint not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to fetch status' });
    }
};

export const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, authority_id, description } = req.body;
        console.log(`Backend: Update status request for complaint_id: ${id} to ${status}`);

        await reportService.updateStatus(id, status, authority_id, description);

        console.log(`Backend: Successfully updated status for complaint_id: ${id}`);
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        if (error.message === 'Complaint not found') {
            console.log(`Backend: No complaint found to update status for ID: ${req.params.id}`);
            return res.status(404).json({ error: error.message });
        }
        console.error('Update status error:', error.message);
        res.status(500).json({ error: 'Failed to update complaint status: ' + error.message });
    }
};
