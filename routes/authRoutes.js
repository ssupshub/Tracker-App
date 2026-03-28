const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);

module.exports = router;
