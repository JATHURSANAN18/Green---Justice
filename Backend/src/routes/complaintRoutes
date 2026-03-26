import express from 'express';
import { submitComplaint, getComplaintStatus, updateComplaintStatus } from '../controllers/reportController.js';

const router = express.Router();

router.post('/', submitComplaint);
router.get('/:id/status', getComplaintStatus);
router.patch('/:id/status', updateComplaintStatus);

export default router;
