const { getSupabase } = require('../../services/database');

/**
 * Search posts by text content, title, or hashtags
 * GET /api/search/posts
 */
const searchPosts = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = q.trim();

    // Search in posts table with text search
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
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Also search in hashtags if the search term looks like a hashtag or is a word
    if (searchTerm.startsWith('#')) {
      // Match the full hashtag, including the #
      query = query.or(`hashtags.cs.{${searchTerm}}`);
    } else {
      // Also search for hashtags with # prepended
      query = query.or(`hashtags.cs.{#${searchTerm}}`);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error searching posts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search posts'
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
    console.error('Posts search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Search users by username, name, or bio
 * GET /api/search/users
 */
const searchUsers = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = q.trim();

    const { data: users, error, count } = await supabase
      .from('users')
      .select(`
        id,
        username,
        name,
        bio,
        avatar_url,
        created_at
      `)
      .or(`username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error searching users:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search users'
      });
    }

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || users.length
      }
    });
  } catch (error) {
    console.error('Users search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Search hashtags
 * GET /api/search/hashtags
 */
const searchHashtags = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = q.trim().replace('#', '');

    // Get all posts and extract hashtags that match the search term
    const { data: posts, error } = await supabase
      .from('posts')
      .select('hashtags')
      .not('hashtags', 'is', null);

    if (error) {
      console.error('Error searching hashtags:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search hashtags'
      });
    }

    // Extract and count hashtags
    const hashtagCounts = {};
    posts.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach(tag => {
          if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          }
        });
      }
    });

    // Convert to array and sort by count
    const hashtags = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(offset, offset + limit);

    res.json({
      success: true,
      data: hashtags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Object.keys(hashtagCounts).length
      }
    });
  } catch (error) {
    console.error('Hashtags search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * General search across all types
 * GET /api/search
 */
const generalSearch = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { q, type = 'all', page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = q.trim();
    const offset = (page - 1) * limit;

    let results = {};

    // Search posts if type is 'all' or 'posts'
    if (type === 'all' || type === 'posts') {
      const { data: posts, error: postsError } = await supabase
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
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range(0, limit - 1);

      if (!postsError) {
        results.posts = posts;
      }
    }

    // Search users if type is 'all' or 'users'
    if (type === 'all' || type === 'users') {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          username,
          name,
          bio,
          avatar_url,
          created_at
        `)
        .or(`username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range(0, limit - 1);

      if (!usersError) {
        results.users = users;
      }
    }

    // Search hashtags if type is 'all' or 'hashtags'
    if (type === 'all' || type === 'hashtags') {
      const { data: posts, error: hashtagsError } = await supabase
        .from('posts')
        .select('hashtags')
        .not('hashtags', 'is', null);

      if (!hashtagsError) {
        const hashtagCounts = {};
        posts.forEach(post => {
          if (post.hashtags && Array.isArray(post.hashtags)) {
            post.hashtags.forEach(tag => {
              if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
                hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
              }
            });
          }
        });

        results.hashtags = Object.entries(hashtagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      }
    }

    // Search recipes if type is 'all' or 'recipes'
    if (type === 'all' || type === 'recipes') {
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,ingredients.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range(0, limit - 1);

      if (!recipesError) {
        results.recipes = recipes || [];
      } else {
        console.error('Error searching recipes:', recipesError);
        results.recipes = [];
      }
    }

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('General search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get popular hashtags
 * GET /api/search/popular-hashtags
 */
const getPopularHashtags = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { limit = 10 } = req.query;

    // Get all posts with hashtags
    const { data: posts, error } = await supabase
      .from('posts')
      .select('hashtags')
      .not('hashtags', 'is', null);

    if (error) {
      console.error('Error fetching posts for hashtags:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch popular hashtags'
      });
    }

    // Count hashtag occurrences
    const hashtagCounts = {};
    posts.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach(tag => {
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array, sort by count, and limit
    const popularHashtags = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: popularHashtags
    });
  } catch (error) {
    console.error('Popular hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Search recipes by title, description, or ingredients
 * GET /api/search/recipes
 */
const searchRecipes = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    const offset = (page - 1) * limit;
    const searchTerm = q.trim();
    // Search in recipes table with text search
    let query = supabase
      .from('recipes')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,ingredients.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    const { data: recipes, error, count } = await query;
    if (error) {
      console.error('Error searching recipes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search recipes'
      });
    }
    res.json({
      success: true,
      data: recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || recipes.length
      }
    });
  } catch (error) {
    console.error('Recipes search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  searchPosts,
  searchUsers,
  searchHashtags,
  generalSearch,
  getPopularHashtags,
  searchRecipes
}; 