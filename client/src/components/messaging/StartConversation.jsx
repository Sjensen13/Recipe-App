import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';

const StartConversation = ({ targetUser, className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartConversation = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id === targetUser.id) {
      return;
    }
    // Navigate to messages page, passing the target user id as state
    navigate('/app/messages', { state: { targetUserId: targetUser.id } });
  };

  if (user?.id === targetUser.id) {
    return null;
  }

  return (
    <button
      onClick={handleStartConversation}
      className={`
        inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg
        bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-colors ${className}
      `}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      Message
    </button>
  );
};

export default StartConversation; 