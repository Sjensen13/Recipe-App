const express = require('express');
const router = express.Router();

const { getMe, updateProfile, createProfile, login, getEmailByUsername } = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');

// Route to handle username/email login
router.post('/login', login);

// Route to get email by username (for password reset)
router.post('/get-email-by-username', getEmailByUsername);

// Route to create user profile (called during registration)
router.post('/create-profile', createProfile);

// Protected routes - user must be authenticated via Supabase
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

module.exports = router; 