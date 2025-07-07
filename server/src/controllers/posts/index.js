const { getSupabase } = require('../../services/database');
const { 
  createLikeNotification, 
  createCommentNotification 
} = require('../notifications');

/**
 * Get all posts with pagination
 * GET /api/posts
 */
const getPosts = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { page = 1, limit = 10, userId, hashtag } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        ),
        likes (id, user_id),
        comments (id, content, created_at, users!comments_user_id_fkey (username, name))
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Filter by hashtag if specified
    if (hashtag) {
      query = query.contains('hashtags', [hashtag]);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch posts'
      });
    }

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || posts.length
      }
    });
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get single post by ID
 * GET /api/posts/:id
 */
const getPost = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        ),
        likes (id, user_id),
        comments (
          id,
          content,
          created_at,
          users!comments_user_id_fkey (username, name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      console.error('Error fetching post:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch post'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Post fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create new post
 * POST /api/posts
 */
const createPost = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { title, content, image_url, recipe_data, hashtags } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title,
        content,
        image_url,
        recipe_data,
        hashtags: hashtags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create post'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update post
 * PUT /api/posts/:id
 */
const updatePost = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { id } = req.params;
    const { title, content, image_url, recipe_data, hashtags } = req.body;
    const userId = req.user.id;

    // Check if post exists and user owns it
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch post'
      });
    }

    if (existingPost.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }

    // Update post
    const { data: post, error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        image_url,
        recipe_data,
        hashtags: hashtags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update post'
      });
    }

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete post
 * DELETE /api/posts/:id
 */
const deletePost = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if post exists and user owns it
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id, image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch post'
      });
    }

    if (existingPost.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Delete post (this will cascade delete comments and likes)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete post'
      });
    }

    // TODO: Delete image from Cloudinary if image_url exists
    // This would require implementing Cloudinary delete functionality

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Post deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Like or unlike a post
const likePost = async (req, res) => {
  const supabase = getSupabase();
  const userId = req.user.id;
  const postId = req.params.id;

  // Check if user already liked the post
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existingLike) {
    // Unlike (remove like)
    await supabase.from('likes').delete().eq('id', existingLike.id);
    return res.json({ success: true, liked: false });
  } else {
    // Like (add like)
    await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    
    // Get post details for notification
    const { data: post } = await supabase
      .from('posts')
      .select('user_id, title')
      .eq('id', postId)
      .single();

    // Get user details for notification
    const { data: user } = await supabase
      .from('users')
      .select('username, name')
      .eq('id', userId)
      .single();

    // Create notification if post owner is different from liker
    if (post && post.user_id !== userId) {
      const actorName = user?.name || user?.username || 'Someone';
      await createLikeNotification(
        post.user_id,
        userId,
        actorName,
        postId,
        post.title
      );
    }

    return res.json({ success: true, liked: true });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  const supabase = getSupabase();
  const userId = req.user.id;
  const postId = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content,
      created_at: new Date().toISOString()
    })
    .select('*')
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: 'Failed to add comment' });
  }

  // Get post details for notification
  const { data: post } = await supabase
    .from('posts')
    .select('user_id, title')
    .eq('id', postId)
    .single();

  // Get user details for notification
  const { data: user } = await supabase
    .from('users')
    .select('username, name')
    .eq('id', userId)
    .single();

  // Create notification if post owner is different from commenter
  if (post && post.user_id !== userId) {
    const actorName = user?.name || user?.username || 'Someone';
    await createCommentNotification(
      post.user_id,
      userId,
      actorName,
      postId,
      comment.id,
      content
    );
  }

  res.status(201).json({ success: true, comment });
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment
}; 