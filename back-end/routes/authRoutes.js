const express = require('express');
const router = express.Router();
const { loginAuthority, registerAuthority } = require('../controllers/authController');

router.post('/login', loginAuthority);
router.post('/register', registerAuthority);

module.exports = router;
