import authorityRepository from '../repositories/authorityRepository.js';

const SRI_LANKAN_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
    'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

class AuthorityService {
    async registerAuthorityData(payload) {
        const { name, email, password, region } = payload;
        
        if (!name || !email || !password || !region) {
            throw new Error('All fields are required, including district');
        }

        if (!SRI_LANKAN_DISTRICTS.includes(region)) {
            throw new Error('Invalid Sri Lankan district selected');
        }

        const existing = await authorityRepository.findByEmail(email);
        if (existing) {
            const error = new Error('Email already registered');
            error.status = 409;
            throw error;
        }

        const authorityId = await authorityRepository.createAuthority(name, email, password, region);
        return authorityId;
    }

    async login(email, password) {
        const authority = await authorityRepository.findByEmailAndPassword(email, password);
        
        if (!authority) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            throw error;
        }

        await authorityRepository.updateLastActive(authority.authority_id);
        return authority;
    }

    async getStats(district) {
        const total = await authorityRepository.getComplaintCount(district);
        const resolved = await authorityRepository.getResolvedComplaintCount(district);
        const pending = await authorityRepository.getPendingComplaintCount(district);

        return { total, resolved, pending };
    }

    async getComplaintsMap(district) {
        const rows = await authorityRepository.getAllComplaintsForAuthority(district);

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

        const complaintsArray = Object.values(complaintsMap);
        complaintsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return complaintsArray;
    }

    async removeComplaint(id) {
        const isDeleted = await authorityRepository.deleteComplaint(id);
        if (!isDeleted) {
            const error = new Error('Complaint not found');
            error.status = 404;
            throw error;
        }
        return true;
    }
}

export default new AuthorityService();
