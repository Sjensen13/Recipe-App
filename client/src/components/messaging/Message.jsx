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
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwnMessage && (
          <div className="flex-shrink-0 mr-2">
            <Avatar
              src={message.sender?.avatar_url}
              alt={message.sender?.name || message.sender?.username}
              size="sm"
            />
          </div>
        )}
        
        <div className="relative group">
          <div
            className={`
              px-4 py-2 rounded-lg break-words
              ${isOwnMessage
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }
            `}
            onMouseEnter={() => setShowOptions(true)}
            onMouseLeave={() => setShowOptions(false)}
          >
            <p className="text-sm">{message.content}</p>
            
            <div className={`
              text-xs mt-1 flex items-center justify-between
              ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}
            `}>
              <span>{formatTime(message.created_at)}</span>
              {message.read_at && isOwnMessage && (
                <span className="ml-2">✓✓</span>
              )}
            </div>
          </div>
          
          {/* Message options */}
          {showOptions && isOwnMessage && (
            <div className="absolute top-0 right-0 transform translate-x-full -translate-y-1/2 z-10">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message; 