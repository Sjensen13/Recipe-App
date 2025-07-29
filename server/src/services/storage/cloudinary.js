const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Upload an image to Cloudinary
   * @param {Buffer|string} file - File buffer or base64 string
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(file, options = {}) {
    try {

      
      // Check if Cloudinary is properly configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
      }
      
      const uploadOptions = {
        folder: options.folder || 'recipe-app',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: options.transformation || [],
        ...options
      };

      // If file is a buffer, convert to base64
      let fileData = file;
      if (Buffer.isBuffer(file)) {
        fileData = `data:image/jpeg;base64,${file.toString('base64')}`;
      }

      const result = await cloudinary.uploader.upload(fileData, uploadOptions);
      
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
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload image with user-specific folder
   * @param {Buffer|string} file - File buffer or base64 string
   * @param {string} userId - User ID for folder organization
   * @param {string} type - Type of upload (posts, avatars, etc.)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadUserImage(file, userId, type = 'posts', options = {}) {
    const folder = `recipe-app/${type}/${userId}`;
    return this.uploadImage(file, {
      folder,
      ...options
    });
  }

  /**
   * Upload post image with optimizations
   * @param {Buffer|string} file - File buffer or base64 string
   * @param {string} userId - User ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadPostImage(file, userId, options = {}) {
    return this.uploadUserImage(file, userId, 'posts', {
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      ...options
    });
  }

  /**
   * Upload avatar image with optimizations
   * @param {Buffer|string} file - File buffer or base64 string
   * @param {string} userId - User ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadAvatarImage(file, userId, options = {}) {
    return this.uploadUserImage(file, userId, 'avatars', {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      ...options
    });
  }

  /**
   * Delete an image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
        message: result.result
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Generate optimized URL for different sizes
   * @param {string} publicId - Cloudinary public ID
   * @param {string} size - Size variant (thumbnail, medium, large)
   * @returns {string} Optimized URL
   */
  generateOptimizedUrl(publicId, size = 'medium') {
    const transformations = {
      thumbnail: { width: 150, height: 150, crop: 'fill' },
      small: { width: 300, height: 300, crop: 'limit' },
      medium: { width: 600, height: 600, crop: 'limit' },
      large: { width: 1200, height: 800, crop: 'limit' }
    };

    const transformation = transformations[size] || transformations.medium;
    return cloudinary.url(publicId, {
      transformation: [transformation, { quality: 'auto', fetch_format: 'auto' }]
    });
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
      original: cloudinary.url(publicId)
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
}

module.exports = new CloudinaryService(); 