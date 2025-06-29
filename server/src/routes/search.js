const express = require('express');
const { authenticateToken } = require('../middleware/auth/auth');
const {
  searchPosts,
  searchUsers,
  searchHashtags,
  generalSearch,
  getPopularHashtags,
  searchRecipes
} = require('../controllers/search');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// General search across all types
router.get('/', generalSearch);

// Search posts
router.get('/posts', searchPosts);

// Search users
router.get('/users', searchUsers);

// Search hashtags
router.get('/hashtags', searchHashtags);

// Search recipes
router.get('/recipes', searchRecipes);

// Get popular hashtags
router.get('/popular-hashtags', getPopularHashtags);

// Test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

module.exports = router; 