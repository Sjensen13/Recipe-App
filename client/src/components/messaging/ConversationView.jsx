import React, { useState, useEffect, useRef } from 'react';
import { getMessages, markConversationAsRead } from '../../services/api/messages';
import Message from './Message';
import MessageInput from './MessageInput';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import useUnreadMessages from '../../hooks/useUnreadMessages';

const ConversationView = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { fetchUnreadCount } = useUnreadMessages();

  useEffect(() => {
    if (conversation?.id) {
      if (!conversation.last_message) {
        // Placeholder conversation, no messages yet
        setMessages([]);
        setLoading(false);
        setError(null);
      } else {
        fetchMessages();
        markAsRead();
      }
    }
  }, [conversation?.id]);

  useEffect(() => {
    // No auto-scroll to bottom; messages start at the top
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(conversation.id);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await markConversationAsRead(conversation.id);
      fetchUnreadCount(); // Refetch unread count after marking as read
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const handleMessageSent = (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const handleMessageDelete = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-sm">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Conversation Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="mr-3 p-1 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center flex-1">
          <Avatar
            src={conversation.other_user?.avatar_url}
            alt={conversation.other_user?.name || conversation.other_user?.username}
            size="md"
          />
          <div className="ml-3">
            {conversation.other_user?.username && (
              <div className="font-bold text-gray-900">{conversation.other_user.username}</div>
            )}
            {conversation.other_user?.name && (
              <div className="text-sm text-gray-500">{conversation.other_user.name}</div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <ErrorState message={error} onRetry={fetchMessages} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onDelete={handleMessageDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Message Input - always visible at the bottom */}
      <div className="border-t bg-white p-1 mb-8">
        <MessageInput
          conversationId={conversation.id}
          receiverId={conversation.other_user?.id}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
};

export default ConversationView; 