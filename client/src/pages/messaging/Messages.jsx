import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import ConversationList from '../../components/messaging/ConversationList';
import ConversationView from '../../components/messaging/ConversationView';
import { getUnreadCount, getConversations } from '../../services/api/messages';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showConversationList, setShowConversationList] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    // If navigated with a targetUserId, auto-select or start conversation
    const state = location.state;
    if (state && state.targetUserId && user) {
      fetchAndSelectConversation(state.targetUserId);
    }
    // eslint-disable-next-line
  }, [location.state, user]);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchAndSelectConversation = async (targetUserId) => {
    try {
      const conversations = await getConversations();
      let conversation = conversations.find(
        (c) => c.other_user && c.other_user.id === targetUserId
      );
      if (conversation) {
        setSelectedConversation(conversation);
        setShowConversationList(false);
      } else {
        // Optionally, you could create a new conversation here by sending a blank message or similar logic
        setShowConversationList(true);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowConversationList(false);
    // Update unread count when selecting a conversation
    if (conversation.unread_count > 0) {
      setUnreadCount(prev => Math.max(0, prev - conversation.unread_count));
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-screen">
      <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Conversation List - Hidden on mobile when viewing conversation */}
        <div className={`
          w-full lg:w-1/3 border-r border-gray-200 flex flex-col
          ${showConversationList ? 'block' : 'hidden lg:block'}
        `}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>
        </div>

        {/* Conversation View - Hidden on mobile when showing list */}
        <div className={`
          flex-1 flex flex-col
          ${showConversationList ? 'hidden lg:flex' : 'flex'}
        `}>
          <ConversationView
            conversation={selectedConversation}
            onBack={handleBackToList}
          />
        </div>
      </div>
    </div>
  );
};

export default Messages; 