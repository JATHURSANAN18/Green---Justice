import express from 'express';
import { registerAuthority, loginAuthority, getDashboardStats, getComplaints, deleteComplaint } from '../controllers/authorityController.js';

const router = express.Router();

router.post('/register', registerAuthority);
router.post('/login', loginAuthority);
router.get('/dashboard', getDashboardStats);
router.get('/complaints', getComplaints);
router.delete('/complaints/:id', deleteComplaint);
router.post('/complaints/:id/delete', deleteComplaint);

export default router;
