import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Mail, 
  ChefHat, 
  AtSign,
  Share,
  Trash2
} from 'lucide-react';

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  onNavigate 
}) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'message':
        return <Mail className="w-5 h-5 text-purple-500" />;
      case 'recipe_match':
        return <ChefHat className="w-5 h-5 text-orange-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-indigo-500" />;
      case 'recipe_shared':
        return <Share className="w-5 h-5 text-teal-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActorAvatar = () => {
    if (notification.data?.actor_avatar) {
      return notification.data.actor_avatar;
    }
    return null;
  };

  const getActorName = () => {
    return notification.data?.actor_name || 'Someone';
  };

  const handleClick = () => {
    // Mark as read if not already read
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (onNavigate) {
      onNavigate(notification);
    } else {
      // Default navigation logic
      switch (notification.type) {
        case 'like':
        case 'comment':
          if (notification.data?.post_id) {
            navigate(`/app/post/${notification.data.post_id}`);
          }
          break;
        case 'follow':
          if (notification.data?.actor_id) {
            navigate(`/app/profile/${notification.data.actor_id}`);
          }
          break;
        case 'message':
          navigate('/app/messages');
          break;
        case 'recipe_match':
          if (notification.data?.recipe_id) {
            navigate(`/app/recipe/${notification.data.recipe_id}`);
          }
          break;
        case 'mention':
          if (notification.data?.post_id) {
            navigate(`/app/post/${notification.data.post_id}`);
          }
          break;
        case 'recipe_shared':
          if (notification.data?.recipe_id) {
            navigate(`/app/recipe/${notification.data.recipe_id}`);
          }
          break;
        default:
          break;
      }
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <div 
      className={`
        flex items-start p-4 cursor-pointer transition-colors
        ${notification.is_read 
          ? 'bg-white hover:bg-gray-50' 
          : 'bg-blue-50 hover:bg-blue-100'
        }
        border-b border-gray-100
      `}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mr-3 mt-1">
        {getIcon(notification.type)}
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0 mr-3">
        <Avatar
          src={getActorAvatar()}
          alt={getActorName()}
          size="sm"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{getActorName()}</span>
              {' '}
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTime(notification.created_at)}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2 ml-2">
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem; 