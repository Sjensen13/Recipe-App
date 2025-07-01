import React, { useState, useEffect, useRef } from 'react';
import { getConversations } from '../../services/api/messages';
import { searchUsers } from '../../services/api/search';
import { sendMessage } from '../../services/api/messages';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';

const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchWrapperRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchResults([]);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearchLoading(true);
    try {
      const response = await searchUsers(query);
      const filtered = response.data.filter(user =>
        user.username && user.username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setSearchError(null);
      setShowDropdown(filtered.length > 0);
    } catch (err) {
      setSearchError('Failed to search users');
      setShowDropdown(false);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery && searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleStartConversation = async (user) => {
    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.other_user && c.other_user.id === user.id
    );
    if (existing) {
      onSelectConversation(existing);
      setSearchQuery('');
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      // Send a first message to start a conversation (could be empty or a default greeting)
      const messageData = { recipientId: user.id, content: '' };
      const response = await sendMessage(messageData);
      // Refetch conversations to include the new one
      await fetchConversations();
      // Find the new conversation
      const newConv = conversations.find(
        (c) => c.other_user && c.other_user.id === user.id
      );
      if (newConv) {
        onSelectConversation(newConv);
      }
      setSearchQuery('');
      setSearchResults([]);
      setShowDropdown(false);
    } catch (err) {
      setSearchError('Failed to start conversation');
      setShowDropdown(false);
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
    <>
      <div className="mb-4 relative" ref={searchWrapperRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          onFocus={handleInputFocus}
          placeholder="Search users to message..."
          className="w-full p-2 border rounded"
        />
        {searchError && <div className="text-red-500">{searchError}</div>}
        {showDropdown && searchQuery && searchResults.length > 0 && (
          <div className="bg-white border rounded shadow mt-2 max-h-60 overflow-y-auto z-10 absolute w-full left-0">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleStartConversation(user)}
              >
                <Avatar src={user.avatar_url} alt={user.username} size="sm" />
                <span className="ml-2">{user.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>
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
                  {conversation.other_user?.username}
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
    </>
  );
};

export default ConversationList; 