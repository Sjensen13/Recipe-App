const express = require('express');
const router = express.Router();

const { register, login, logout, getMe } = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);

module.exports = router; 