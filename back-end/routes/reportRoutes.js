const express = require('express');
const router = express.Router();
const { 
  submitReport, 
  getReports, 
  updateReportStatus, 
  deleteReport, 
  getDashboardStats 
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(submitReport)
  .get(getReports);

router.get('/dashboard', protect, getDashboardStats);
router.put('/:id/status', protect, updateReportStatus);
router.delete('/:id', protect, deleteReport);

module.exports = router;
