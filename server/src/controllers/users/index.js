const { supabase } = require('../../services/supabase/client');

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user profile from custom users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile'
      });
    }

    // Create user data from profile (no need for admin auth)
    const userData = {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      name: profile.name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      // Include user_metadata if available in profile
      user_metadata: profile.user_metadata || {}
    };

    res.json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    if (!userId || !followerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and follower ID are required'
      });
    }

    if (userId === followerId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Follow check error:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check follow status'
      });
    }

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Create follow relationship
    const { data: follow, error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: userId
      })
      .select()
      .single();

    if (followError) {
      console.error('Follow creation error:', followError);
      return res.status(500).json({
        success: false,
        message: 'Failed to follow user'
      });
    }

    res.json({
      success: true,
      message: 'User followed successfully',
      data: { follow }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    if (!userId || !followerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and follower ID are required'
      });
    }

    // Delete follow relationship
    const { error: unfollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', userId);

    if (unfollowError) {
      console.error('Unfollow error:', unfollowError);
      return res.status(500).json({
        success: false,
        message: 'Failed to unfollow user'
      });
    }

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get followers count
    const { count, error: countError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (countError) {
      console.error('Followers count error:', countError);
      return res.status(500).json({
        success: false,
        message: 'Failed to get followers count'
      });
    }

    res.json({
      success: true,
      data: { followersCount: count || 0 }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get following count
    const { count, error: countError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (countError) {
      console.error('Following count error:', countError);
      return res.status(500).json({
        success: false,
        message: 'Failed to get following count'
      });
    }

    res.json({
      success: true,
      data: { followingCount: count || 0 }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getFollowersList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const offset = (page - 1) * limit;

    // First, get the follow relationships
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('follower_id, created_at')
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (followsError) {
      console.error('Followers list error:', followsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to get followers list'
      });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (countError) {
      console.error('Followers count error:', countError);
      return res.status(500).json({
        success: false,
        message: 'Failed to get followers count'
      });
    }

    // If we have follows, get the user details for each follower
    let followers = [];
    if (follows && follows.length > 0) {
      const followerIds = follows.map(f => f.follower_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, username, bio, avatar_url, created_at')
        .in('id', followerIds);

      if (usersError) {
        console.error('Users fetch error:', usersError);
        return res.status(500).json({
          success: false,
          message: 'Failed to get user details'
        });
      }

      // Combine the data
      followers = follows.map(follow => {
        const user = users.find(u => u.id === follow.follower_id);
        return {
          ...user,
          followedAt: follow.created_at
        };
      });
    }

    res.json({
      success: true,
      data: {
        followers: followers || [],
        totalCount: count || 0,
        currentPage: parseInt(page),
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get followers list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getFollowingList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const offset = (page - 1) * limit;

    // First, get the follow relationships
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (followsError) {
      console.error('Following list error:', followsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to get following list'
      });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (countError) {
      console.error('Following count error:', countError);
      return res.status(500).json({
        success: false,
        message: 'Failed to get following count'
      });
    }

    // If we have follows, get the user details for each following
    let following = [];
    if (follows && follows.length > 0) {
      const followingIds = follows.map(f => f.following_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, username, bio, avatar_url, created_at')
        .in('id', followingIds);

      if (usersError) {
        console.error('Users fetch error:', usersError);
        return res.status(500).json({
          success: false,
          message: 'Failed to get user details'
        });
      }

      // Combine the data
      following = follows.map(follow => {
        const user = users.find(u => u.id === follow.following_id);
        return {
          ...user,
          followedAt: follow.created_at
        };
      });
    }

    res.json({
      success: true,
      data: {
        following: following || [],
        totalCount: count || 0,
        currentPage: parseInt(page),
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get following list error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const checkIsFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!followerId) {
      return res.json({
        success: true,
        data: { isFollowing: false }
      });
    }

    // Check if following
    const { data: follow, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Follow check error:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check follow status'
      });
    }

    res.json({
      success: true,
      data: { isFollowing: !!follow }
    });
  } catch (error) {
    console.error('Check is following error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Fetch posts liked by a user
const getLikedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get all likes for this user
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId);

    if (likesError) {
      console.error('Likes fetch error:', likesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch liked posts'
      });
    }

    if (!likes || likes.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const postIds = likes.map(like => like.post_id);

    // Fetch posts with these IDs, including likes and comments
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey(id, username, name, avatar_url),
        likes (id, user_id),
        comments (id, content, created_at, users!comments_user_id_fkey (username, name))
      `)
      .in('id', postIds);

    if (postsError) {
      console.error('Posts fetch error:', postsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch liked posts'
      });
    }

    // Transform posts for frontend expectations
    const transformedPosts = (posts || []).map(post => {
      console.log('Liked post original:', post);
      console.log('Liked post users:', post.users);
      console.log('Liked post image_url:', post.image_url);
      
      // Ensure user data exists, if not create a fallback
      const userData = post.users || {
        id: post.user_id,
        username: 'Unknown User',
        name: 'Unknown User',
        avatar_url: null
      };
      
      return {
        ...post,
        user: userData,
        image: post.image_url,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.length || 0
      };
    });

    res.json({
      success: true,
      data: transformedPosts
    });
  } catch (error) {
    console.error('Get liked posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Test endpoint to check database schema
const testDatabaseSchema = async (req, res) => {
  try {
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    // Test posts table
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(5);

    // Test posts with user join
    const { data: postsWithUsers, error: postsWithUsersError } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          name,
          avatar_url
        )
      `)
      .limit(5);

    res.json({
      success: true,
      data: {
        users: users || [],
        posts: posts || [],
        postsWithUsers: postsWithUsers || [],
        errors: {
          users: usersError,
          posts: postsError,
          postsWithUsers: postsWithUsersError
        }
      }
    });
  } catch (error) {
    console.error('Database schema test error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Followers count endpoint
const getFollowersCount = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    if (error) {
      console.error('Followers count error:', error);
      return res.status(500).json({ success: false, message: 'Failed to get followers count' });
    }
    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get followers count error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Following count endpoint
const getFollowingCount = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    if (error) {
      console.error('Following count error:', error);
      return res.status(500).json({ success: false, message: 'Failed to get following count' });
    }
    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get following count error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all posts by user
const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    // Use supabase to fetch posts for this user
    const { data: posts, error } = await supabase
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching user posts:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch user posts' });
    }
    // Transform posts for frontend expectations
    const transformedPosts = (posts || []).map(post => {
      console.log('Original post:', post);
      console.log('Post users:', post.users);
      console.log('Post image_url:', post.image_url);
      
      // Ensure user data exists, if not create a fallback
      const userData = post.users || {
        id: post.user_id,
        username: 'Unknown User',
        name: 'Unknown User',
        avatar_url: null
      };
      
      return {
        ...post,
        user: userData,
        image: post.image_url,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.length || 0
      };
    });
    console.log('Transformed posts:', transformedPosts);
    res.json(transformedPosts);
  } catch (error) {
    console.error('Get posts by user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
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
}; 