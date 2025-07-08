const { getSupabase } = require('../../services/database');
const { createMessageNotification } = require('../notifications');

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const user_id = req.user.id;
    const supabase = getSupabase();

    console.log('Getting conversations for user:', user_id);

    // Get all messages where user is sender or receiver
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      return res.status(500).json({ message: 'Failed to fetch conversations' });
    }

    console.log('Found messages:', messages?.length || 0);

    // Get unique user IDs from messages
    const userIds = new Set();
    messages.forEach(message => {
      if (message.sender_id) userIds.add(message.sender_id);
      if (message.receiver_id) userIds.add(message.receiver_id);
    });

    console.log('Unique user IDs:', Array.from(userIds));

    // Fetch user data for all participants
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, name, avatar_url')
      .in('id', Array.from(userIds));

    if (usersError) {
      console.error('Error fetching users:', usersError);
      console.error('Full users error object:', JSON.stringify(usersError, null, 2));
      return res.status(500).json({ message: 'Failed to fetch user data' });
    }

    console.log('Found users:', users?.length || 0);

    // Create a map of users by ID
    const usersMap = new Map();
    users.forEach(user => usersMap.set(user.id, user));

    // Group messages by conversation (unique pairs of users)
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const otherUserId = message.sender_id === user_id ? message.receiver_id : message.sender_id;
      const otherUser = usersMap.get(otherUserId);
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          id: otherUserId, // Use other user's ID as conversation ID
          other_user: otherUser,
          last_message: {
            ...message,
            sender: usersMap.get(message.sender_id),
            receiver: usersMap.get(message.receiver_id)
          },
          unread_count: 0, // You can implement unread logic later
          updated_at: message.created_at,
          created_at: message.created_at
        });
      } else {
        const conversation = conversationsMap.get(otherUserId);
        if (message.created_at > conversation.last_message.created_at) {
          conversation.last_message = {
            ...message,
            sender: usersMap.get(message.sender_id),
            receiver: usersMap.get(message.receiver_id)
          };
          conversation.updated_at = message.created_at;
        }
      }
    });

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    console.log('Returning conversations:', conversations.length);
    res.json(conversations);
  } catch (error) {
    console.error('Error in getConversations:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get messages for a specific conversation (between two users)
const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params; // This is actually the other user's ID
    const user_id = req.user.id;
    const supabase = getSupabase();

    // Get messages between current user and the other user
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user_id},receiver_id.eq.${conversation_id}),and(sender_id.eq.${conversation_id},receiver_id.eq.${user_id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }

    // Get unique user IDs from messages
    const userIds = new Set();
    messages.forEach(message => {
      if (message.sender_id) userIds.add(message.sender_id);
      if (message.receiver_id) userIds.add(message.receiver_id);
    });

    // Fetch user data for all participants
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, name, avatar_url')
      .in('id', Array.from(userIds));

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({ message: 'Failed to fetch user data' });
    }

    // Create a map of users by ID
    const usersMap = new Map();
    users.forEach(user => usersMap.set(user.id, user));

    // Add user data to messages
    const messagesWithUsers = messages.map(message => ({
      ...message,
      sender: usersMap.get(message.sender_id),
      receiver: usersMap.get(message.receiver_id)
    }));

    res.json(messagesWithUsers);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { conversation_id, content, receiver_id } = req.body;
    const user_id = req.user.id;
    const supabase = getSupabase();

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Use receiver_id from body or conversation_id as receiver_id
    const actualReceiverId = receiver_id || conversation_id;

    if (!actualReceiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    // Create the message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user_id,
        receiver_id: actualReceiverId,
        content: content.trim(),
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return res.status(500).json({ message: 'Failed to send message' });
    }

    // Fetch user data for sender and receiver
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, name, avatar_url')
      .in('id', [user_id, actualReceiverId]);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({ message: 'Failed to fetch user data' });
    }

    // Create a map of users by ID
    const usersMap = new Map();
    users.forEach(user => usersMap.set(user.id, user));

    // Add user data to message
    const messageWithUsers = {
      ...message,
      sender: usersMap.get(message.sender_id),
      receiver: usersMap.get(message.receiver_id)
    };

    // Create notification for receiver
    const sender = usersMap.get(message.sender_id);
    const receiver = usersMap.get(message.receiver_id);
    
    if (sender && receiver) {
      const actorName = sender.name || sender.username || 'Someone';
      const messagePreview = content.trim().length > 50 
        ? content.trim().substring(0, 50) + '...' 
        : content.trim();
      
      await createMessageNotification(
        actualReceiverId,
        user_id,
        actorName,
        message.id,
        messagePreview
      );
    }

    res.status(201).json(messageWithUsers);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark conversation as read
const markAsRead = async (req, res) => {
  try {
    const { conversation_id } = req.params; // This is the other user's ID
    const user_id = req.user.id;
    const supabase = getSupabase();

    // Mark all messages sent to the user by the other user as read
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', conversation_id)
      .eq('receiver_id', user_id)
      .is('read_at', null);

    if (error) {
      return res.status(500).json({ message: 'Failed to mark messages as read' });
    }

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const user_id = req.user.id;
    const supabase = getSupabase();

    // Verify user owns the message
    const { data: message, error: findError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', message_id)
      .eq('sender_id', user_id)
      .single();

    if (findError || !message) {
      return res.status(403).json({ message: 'Cannot delete this message' });
    }

    // Delete the message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', message_id);

    if (error) {
      console.error('Error deleting message:', error);
      return res.status(500).json({ message: 'Failed to delete message' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;
    const supabase = getSupabase();

    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user_id)
      .is('read_at', null);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch unread count' });
    }

    res.json({ unread_count: count || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount
}; 