class CloudinaryClient {
  constructor() {
    this.cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    
    if (!this.cloudName || !this.uploadPreset) {
      console.warn('Cloudinary configuration missing. Please check your environment variables.');
      console.warn('Required variables: REACT_APP_CLOUDINARY_CLOUD_NAME, REACT_APP_CLOUDINARY_UPLOAD_PRESET');
    }
  }

  /**
   * Upload image directly to Cloudinary from client
   * @param {File} file - Image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(file, options = {}) {
    if (!this.cloudName || !this.uploadPreset) {
      const missingVars = [];
      if (!this.cloudName) missingVars.push('REACT_APP_CLOUDINARY_CLOUD_NAME');
      if (!this.uploadPreset) missingVars.push('REACT_APP_CLOUDINARY_UPLOAD_PRESET');
      
      throw new Error(`Cloudinary not configured. Missing environment variables: ${missingVars.join(', ')}. Please check CLOUDINARY_SETUP.md for setup instructions.`);
    }

    try {
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('cloud_name', this.cloudName);

      // Add optional parameters
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      if (options.public_id) {
        formData.append('public_id', options.public_id);
      }
      if (options.transformation) {
        formData.append('transformation', options.transformation);
      }

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Upload failed';
        
        // Provide more helpful error messages
        if (errorMessage.includes('Unknown API key') || errorMessage.includes('Invalid upload preset')) {
          throw new Error(`Cloudinary configuration error: ${errorMessage}. Please check your REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET values.`);
        }
        
        throw new Error(`Upload failed: ${errorMessage}`);
      }

      const result = await response.json();

      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * Upload post image with user-specific folder
   * @param {File} file - Image file
   * @param {string} userId - User ID for folder organization
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadPostImage(file, userId, options = {}) {
    const folder = `recipe-app/posts/${userId}`;
    const transformation = 'w_1200,h_800,c_limit,q_auto,f_auto';
    
    return this.uploadImage(file, {
      folder,
      transformation,
      ...options
    });
  }

  /**
   * Upload avatar image with optimizations
   * @param {File} file - Image file
   * @param {string} userId - User ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadAvatarImage(file, userId, options = {}) {
    const folder = `recipe-app/avatars/${userId}`;
    const transformation = 'w_400,h_400,c_fill,g_face,q_auto,f_auto';
    
    return this.uploadImage(file, {
      folder,
      transformation,
      ...options
    });
  }

  /**
   * Generate optimized URL for different sizes
   * @param {string} publicId - Cloudinary public ID
   * @param {string} size - Size variant (thumbnail, small, medium, large)
   * @returns {string} Optimized URL
   */
  generateOptimizedUrl(publicId, size = 'medium') {
    if (!this.cloudName) {
      throw new Error('Cloudinary not configured');
    }

    const transformations = {
      thumbnail: 'w_150,h_150,c_fill',
      small: 'w_300,h_300,c_limit',
      medium: 'w_600,h_600,c_limit',
      large: 'w_1200,h_800,c_limit'
    };

    const transformation = transformations[size] || transformations.medium;
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation},q_auto,f_auto/${publicId}`;
  }

  /**
   * Generate multiple size URLs for responsive images
   * @param {string} publicId - Cloudinary public ID
   * @returns {Object} URLs for different sizes
   */
  generateResponsiveUrls(publicId) {
    return {
      thumbnail: this.generateOptimizedUrl(publicId, 'thumbnail'),
      small: this.generateOptimizedUrl(publicId, 'small'),
      medium: this.generateOptimizedUrl(publicId, 'medium'),
      large: this.generateOptimizedUrl(publicId, 'large'),
      original: `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`
    };
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param {string} url - Cloudinary URL
   * @returns {string} Public ID
   */
  extractPublicId(url) {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split('.')[0];
      return publicId;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }

  /**
   * Check if URL is a Cloudinary URL
   * @param {string} url - URL to check
   * @returns {boolean} True if it's a Cloudinary URL
   */
  isCloudinaryUrl(url) {
    return url && url.includes('cloudinary.com');
  }
}

// Create singleton instance
const cloudinaryClient = new CloudinaryClient();

export default cloudinaryClient; 