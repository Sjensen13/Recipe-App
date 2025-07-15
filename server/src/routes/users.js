const express = require('express');
const router = express.Router();
const { 
  getUserById, 
  followUser, 
  unfollowUser, 
  getFollowers, 
  getFollowing, 
  getFollowersList,
  getFollowingList,
  checkIsFollowing,
  getLikedPosts,
  getFollowersCount,
  getFollowingCount,
  getPostsByUserId,
  testDatabaseSchema
} = require('../controllers/users');
const { authenticateToken } = require('../middleware/auth');

// Get user by ID (public route - no authentication required)
router.get('/:userId', getUserById);

// Follow-related routes (require authentication)
router.post('/:userId/follow', authenticateToken, followUser);
router.delete('/:userId/follow', authenticateToken, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/followers/list', getFollowersList);
router.get('/:userId/following/list', getFollowingList);
router.get('/:userId/is-following', authenticateToken, checkIsFollowing);
router.get('/:userId/follow-status', checkIsFollowing);

// Add liked posts route
router.get('/:userId/liked-posts', getLikedPosts);

// Add endpoint for getting posts by user
router.get('/:userId/posts', getPostsByUserId);

// Followers/following count endpoints (public)
router.get('/:userId/followers-count', getFollowersCount);
router.get('/:userId/following-count', getFollowingCount);

// Test endpoint for database schema
router.get('/test/schema', testDatabaseSchema);

module.exports = router;
