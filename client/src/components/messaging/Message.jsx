import React, { useState } from 'react';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/auth/AuthContext';
import { deleteMessage } from '../../services/api/messages';

const Message = ({ message, onDelete }) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnMessage = message.sender_id === user?.id;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    if (!isOwnMessage) return;
    
    try {
      setDeleting(true);
      await deleteMessage(message.id);
      onDelete(message.id);
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setDeleting(false);
      setShowOptions(false);
    }
  };

  return (
    <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
      {/* Received message: avatar on left */}
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-2 self-end">
          <Avatar
            src={message.sender?.avatar_url}
            alt={message.sender?.name || message.sender?.username}
            size="sm"
            userId={message.sender?.id}
          />
        </div>
      )}
      <div className="flex flex-col items-end max-w-[70%]">
        <div
          className={
            `rounded-2xl px-4 py-1 break-words shadow-sm ` +
            (isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900')
          }
        >
          <p className="text-base leading-relaxed">{message.content}</p>
        </div>
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-400' : 'text-gray-400'} w-full text-right`}>
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};

export default Message; 