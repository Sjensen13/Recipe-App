const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount
} = require('../controllers/messages');

// All routes require authentication
router.use(authenticateToken);

// Get all conversations for the authenticated user
router.get('/conversations', getConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversation_id/messages', getMessages);

// Send a new message (creates conversation if needed)
router.post('/send', sendMessage);

// Mark conversation as read
router.put('/conversations/:conversation_id/read', markAsRead);

// Delete a message
router.delete('/messages/:message_id', deleteMessage);

// Get unread message count
router.get('/unread-count', getUnreadCount);

module.exports = router;
