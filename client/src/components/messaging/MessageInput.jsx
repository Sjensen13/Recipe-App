import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../services/api/messages';

const MessageInput = ({ conversationId, receiverId, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      
      const messageData = {
        content: message.trim(),
        conversation_id: conversationId,
        receiver_id: receiverId
      };

      const sentMessage = await sendMessage(messageData);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      onMessageSent(sentMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show a toast notification here
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="1"
            maxLength="1000"
            disabled={sending}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${message.trim() && !sending
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {sending ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </div>
          )}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mt-1 text-right">
        {message.length}/1000
      </div>
    </form>
  );
};

export default MessageInput; 