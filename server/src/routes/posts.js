const express = require('express');
const { authenticateToken } = require('../middleware/auth/auth');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment
} = require('../controllers/posts');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all posts (with optional pagination and user filtering)
router.get('/', getPosts);

// Get single post by ID
router.get('/:id', getPost);

// Create new post
router.post('/', createPost);

// Update post
router.put('/:id', updatePost);

// Delete post
router.delete('/:id', deletePost);

// Like or unlike a post
router.post('/:id/like', likePost);

// Add a comment to a post
router.post('/:id/comments', addComment);

module.exports = router;
