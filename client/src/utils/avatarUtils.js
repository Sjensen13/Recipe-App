import defaultAvatar from '../assets/images/default-avatar.png';

/**
 * Centralized avatar utility for consistent profile picture handling
 */

// Default avatar fallback
export const DEFAULT_AVATAR = defaultAvatar;

/**
 * Get consistent avatar URL with proper fallback
 * @param {string} avatarUrl - User's avatar URL
 * @param {string} userId - User ID for logging
 * @returns {string} Avatar URL or default fallback
 */
export const getAvatarUrl = (avatarUrl, userId = 'unknown') => {
  if (avatarUrl && avatarUrl.trim()) {
    console.log(`Using avatar URL for user: ${userId}, URL: ${avatarUrl}`);
    return avatarUrl;
  }
  
  console.log(`No avatar URL for user: ${userId}, using default avatar`);
  return DEFAULT_AVATAR;
};

/**
 * Get optimized avatar URL for Cloudinary images
 * @param {string} avatarUrl - User's avatar URL
 * @param {string} size - Size variant (thumbnail, small, medium, large)
 * @param {string} userId - User ID for logging
 * @returns {string} Optimized avatar URL or original
 */
export const getOptimizedAvatarUrl = (avatarUrl, size = 'thumbnail', userId = 'unknown') => {
  if (!avatarUrl || !avatarUrl.trim()) {
    return DEFAULT_AVATAR;
  }

  // Check if it's a Cloudinary URL
  if (avatarUrl.includes('cloudinary.com')) {
    try {
      // Extract public ID from Cloudinary URL
      const urlParts = avatarUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split('.')[0];
      
      // Get cloud name from URL
      const cloudName = urlParts[3];
      
      // Generate optimized URL
      const transformations = {
        thumbnail: 'w_150,h_150,c_fill',
        small: 'w_300,h_300,c_limit',
        medium: 'w_600,h_600,c_limit',
        large: 'w_1200,h_800,c_limit'
      };
      
      const transformation = transformations[size] || transformations.thumbnail;
      const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformation},q_auto,f_auto/${publicId}`;
      
      console.log(`Generated optimized avatar URL for user: ${userId}, size: ${size}`);
      return optimizedUrl;
    } catch (error) {
      console.error('Error generating optimized avatar URL:', error);
      return avatarUrl; // Fallback to original URL
    }
  }
  
  // Not a Cloudinary URL, return as is
  return avatarUrl;
};

/**
 * Handle avatar load error consistently
 * @param {Event} event - Error event
 * @param {string} userId - User ID for logging
 */
export const handleAvatarError = (event, userId = 'unknown') => {
  console.log(`Avatar load error for user: ${userId}, falling back to default`);
  event.target.src = DEFAULT_AVATAR;
};

/**
 * Get user display name with fallback
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export const getUserDisplayName = (user) => {
  return user?.name || 
         user?.username || 
         user?.display_name || 
         `User ${user?.id?.slice(0, 8)}` || 
         'Unknown User';
};

/**
 * Get avatar props for consistent styling
 * @param {string} size - Size variant
 * @returns {Object} Style props
 */
export const getAvatarStyles = (size = 'md') => {
  const sizeMap = {
    sm: { width: '32px', height: '32px' },
    md: { width: '48px', height: '48px' },
    lg: { width: '128px', height: '128px' },
    xl: { width: '160px', height: '160px' }
  };
  
  return {
    ...sizeMap[size] || sizeMap.md,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #f3f4f6'
  };
}; 