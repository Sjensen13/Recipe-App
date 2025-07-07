const { getSupabase } = require('../../services/database');

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    console.log('getNotifications called, user:', req.user);
    const user_id = req.user?.id;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in request' 
      });
    }
    
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;
    
    const supabase = getSupabase();
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (unread_only === 'true') {
      query = query.eq('is_read', false);
    }
    
    const { data: notifications, error } = await query;
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ message: 'Failed to fetch notifications' });
    }
    
    // Get total count for pagination
    let countQuery = supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id);
    
    if (unread_only === 'true') {
      countQuery = countQuery.eq('is_read', false);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error counting notifications:', countError);
    }
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    console.log('getUnreadCount called, user:', req.user);
    const user_id = req.user?.id;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID not found in request' 
      });
    }
    
    const supabase = getSupabase();
    
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error fetching unread count:', error);
      return res.status(500).json({ message: 'Failed to fetch unread count' });
    }
    
    res.json({
      success: true,
      data: { unread_count: count || 0 }
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { notification_id } = req.params;
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notification_id)
      .eq('user_id', user_id);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ message: 'Failed to mark notification as read' });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ message: 'Failed to mark notifications as read' });
    }
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { notification_id } = req.params;
    const supabase = getSupabase();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notification_id)
      .eq('user_id', user_id);
    
    if (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ message: 'Failed to delete notification' });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a notification (internal use)
const createNotification = async (notificationData) => {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to create like notification
const createLikeNotification = async (postOwnerId, actorId, actorName, postId, postTitle) => {
  const notificationData = {
    user_id: postOwnerId,
    type: 'like',
    title: 'New Like',
    message: `${actorName} liked your post`,
    data: {
      actor_id: actorId,
      actor_name: actorName,
      post_id: postId,
      post_title: postTitle
    }
  };
  
  return await createNotification(notificationData);
};

// Helper function to create comment notification
const createCommentNotification = async (postOwnerId, actorId, actorName, postId, commentId, commentContent) => {
  const notificationData = {
    user_id: postOwnerId,
    type: 'comment',
    title: 'New Comment',
    message: `${actorName} commented on your post`,
    data: {
      actor_id: actorId,
      actor_name: actorName,
      post_id: postId,
      comment_id: commentId,
      comment_content: commentContent
    }
  };
  
  return await createNotification(notificationData);
};

// Helper function to create follow notification
const createFollowNotification = async (followedUserId, actorId, actorName) => {
  const notificationData = {
    user_id: followedUserId,
    type: 'follow',
    title: 'New Follower',
    message: `${actorName} started following you`,
    data: {
      actor_id: actorId,
      actor_name: actorName
    }
  };
  
  return await createNotification(notificationData);
};

// Helper function to create message notification
const createMessageNotification = async (receiverId, actorId, actorName, messageId, messagePreview) => {
  const notificationData = {
    user_id: receiverId,
    type: 'message',
    title: 'New Message',
    message: `${actorName} sent you a message`,
    data: {
      actor_id: actorId,
      actor_name: actorName,
      message_id: messageId,
      message_preview: messagePreview
    }
  };
  
  return await createNotification(notificationData);
};

// Helper function to create recipe match notification
const createRecipeMatchNotification = async (userId, recipeId, recipeTitle, matchScore) => {
  const notificationData = {
    user_id: userId,
    type: 'recipe_match',
    title: 'Recipe Match Found',
    message: `We found a recipe that matches your ingredients: ${recipeTitle}`,
    data: {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      match_score: matchScore
    }
  };
  
  return await createNotification(notificationData);
};

// Helper function to create mention notification
const createMentionNotification = async (mentionedUserId, actorId, actorName, postId, postTitle) => {
  const notificationData = {
    user_id: mentionedUserId,
    type: 'mention',
    title: 'You were mentioned',
    message: `${actorName} mentioned you in a post`,
    data: {
      actor_id: actorId,
      actor_name: actorName,
      post_id: postId,
      post_title: postTitle
    }
  };
  
  return await createNotification(notificationData);
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createLikeNotification,
  createCommentNotification,
  createFollowNotification,
  createMessageNotification,
  createRecipeMatchNotification,
  createMentionNotification
}; 