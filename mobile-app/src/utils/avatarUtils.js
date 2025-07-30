/**
 * Centralized avatar utility for consistent profile picture handling in mobile app
 */

// Default avatar fallback for mobile
export const DEFAULT_AVATAR = 'https://via.placeholder.com/40';

/**
 * Get consistent avatar URL with proper fallback
 * @param {string} avatarUrl - User's avatar URL
 * @param {string} userId - User ID for logging
 * @returns {string} Avatar URL or default fallback
 */
export const getAvatarUrl = (avatarUrl, userId = 'unknown') => {
  if (avatarUrl && avatarUrl.trim()) {
    console.log(`Mobile: Using avatar URL for user: ${userId}, URL: ${avatarUrl}`);
    return avatarUrl;
  }
  
  console.log(`Mobile: No avatar URL for user: ${userId}, using placeholder`);
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
      
      console.log(`Mobile: Generated optimized avatar URL for user: ${userId}, size: ${size}`);
      return optimizedUrl;
    } catch (error) {
      console.error('Mobile: Error generating optimized avatar URL:', error);
      return avatarUrl; // Fallback to original URL
    }
  }
  
  // Not a Cloudinary URL, return as is
  return avatarUrl;
};

/**
 * Handle avatar load error consistently
 * @param {Object} error - Error object
 * @param {string} userId - User ID for logging
 */
export const handleAvatarError = (error, userId = 'unknown') => {
  console.log(`Mobile: Avatar load error for user: ${userId}, error:`, error);
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
 * Get avatar source object for React Native Image component
 * @param {string} avatarUrl - User's avatar URL
 * @param {string} userId - User ID for logging
 * @returns {Object} Source object for Image component
 */
export const getAvatarSource = (avatarUrl, userId = 'unknown') => {
  const url = getAvatarUrl(avatarUrl, userId);
  return {
    uri: url,
    headers: { 'Cache-Control': 'no-cache' }
  };
};

/**
 * Get optimized avatar source object for React Native Image component
 * @param {string} avatarUrl - User's avatar URL
 * @param {string} size - Size variant
 * @param {string} userId - User ID for logging
 * @returns {Object} Source object for Image component
 */
export const getOptimizedAvatarSource = (avatarUrl, size = 'thumbnail', userId = 'unknown') => {
  const url = getOptimizedAvatarUrl(avatarUrl, size, userId);
  return {
    uri: url,
    headers: { 'Cache-Control': 'no-cache' }
  };
}; 