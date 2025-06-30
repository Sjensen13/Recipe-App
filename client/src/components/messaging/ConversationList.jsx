import React, { useState, useEffect } from 'react';
import { getConversations } from '../../services/api/messages';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';

const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    
    const content = message.content;
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <ErrorState message={error} onRetry={fetchConversations} />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-sm text-center">
          Start a conversation by messaging someone from their profile
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`
            flex items-center p-4 cursor-pointer rounded-lg transition-colors
            ${selectedConversationId === conversation.id
              ? 'bg-blue-50 border-l-4 border-blue-500'
              : 'hover:bg-gray-50'
            }
          `}
        >
          <div className="flex-shrink-0 mr-3">
            <Avatar
              src={conversation.other_user?.avatar_url}
              alt={conversation.other_user?.name || conversation.other_user?.username}
              size="md"
            />
            {conversation.unread_count > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {conversation.other_user?.name || conversation.other_user?.username}
              </h3>
              <span className="text-xs text-gray-500">
                {formatTime(conversation.last_message?.created_at || conversation.updated_at)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 truncate">
              {formatLastMessage(conversation.last_message)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList; 