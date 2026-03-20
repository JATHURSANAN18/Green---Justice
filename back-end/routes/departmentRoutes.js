const express = require('express');
const router = express.Router();
const { suggestDepartment, createDepartment } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createDepartment);
router.get('/suggest/:reportId', protect, suggestDepartment);

module.exports = router;
