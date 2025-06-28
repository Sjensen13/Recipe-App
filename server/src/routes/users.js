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
  checkIsFollowing 
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

module.exports = router;
