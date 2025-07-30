import React from 'react';
import CloudinaryImage from './CloudinaryImage';
import { getAvatarUrl, handleAvatarError, getAvatarStyles } from '../../utils/avatarUtils';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  showUploadButton = false,
  onUpload,
  uploading = false,
  userId = 'unknown'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
        {src ? (
          <CloudinaryImage 
            src={getAvatarUrl(src, userId)} 
            alt={alt}
            size={size === 'sm' ? 'thumbnail' : size === 'lg' || size === 'xl' ? 'medium' : 'small'}
            className="w-full h-full object-cover"
            onError={(e) => handleAvatarError(e, userId)}
            fallback={
              <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold ${textSizes[size]}`}>
                {getInitials(alt || 'User')}
              </div>
            }
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold ${textSizes[size]}`}>
            {getInitials(alt || 'User')}
          </div>
        )}
      </div>
      
      {showUploadButton && (
        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </label>
      )}
    </div>
  );
};

export default Avatar; 