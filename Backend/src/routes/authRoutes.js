import express from 'express';
import { registerAuthority, loginAuthority, getDashboardStats, getComplaints, deleteComplaint } from '../controllers/authorityController.js';

const router = express.Router();

router.post('/register', registerAuthority);
router.post('/login', loginAuthority);
router.get('/dashboard', getDashboardStats);
router.get('/complaints', getComplaints);
router.delete('/complaintas/:id', deleteComplaint);

export default router;
