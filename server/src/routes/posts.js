const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getComments
} = require('../controllers/posts');

console.log('Posts router loaded');

const router = express.Router();

// Apply optional authentication middleware to all routes
router.use(optionalAuth);

// Get all posts (with optional pagination and user filtering)
router.get('/', getPosts);

// Get comments for a post
router.get('/:id/comments', getComments);

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
