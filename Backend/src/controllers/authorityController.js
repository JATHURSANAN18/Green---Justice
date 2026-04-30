import authorityService from '../services/authorityService.js';

export const registerAuthority = async (req, res) => {
    try {
        const authorityId = await authorityService.registerAuthorityData(req.body);
        res.status(201).json({ message: 'Authority registered successfully', authority_id: authorityId });
    } catch (error) {
        console.error('Registration error:', error.message);
        if (error.status === 409) return res.status(409).json({ error: error.message });
        if (error.message.includes('required') || error.message.includes('Invalid')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to register authority: ' + error.message });
    }
};

export const loginAuthority = async (req, res) => {
    try {
        const authority = await authorityService.login(req.body.email, req.body.password);
        res.status(200).json({ message: 'Login successful', token: 'mock-jwt-token', authority });
    } catch (error) {
        console.error('Login error:', error.message);
        if (error.status === 401) return res.status(401).json({ error: error.message });
        res.status(500).json({ error: 'Authentication failed: ' + error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const { district } = req.query;
        const stats = await authorityService.getStats(district);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getComplaints = async (req, res) => {
    try {
        const { district } = req.query;
        const complaintsMap = await authorityService.getComplaintsMap(district);
        res.status(200).json(complaintsMap);
    } catch (error) {
        console.error('Failed to fetch complaints:', error.message);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

export const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Backend: Attempting to delete complaint_id: ${id}`);
        
        await authorityService.removeComplaint(id);

        console.log(`Backend: Successfully deleted complaint_id: ${id}`);
        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error.message);
        if (error.status === 404) return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Failed to delete complaint: ' + error.message });
    }
};
