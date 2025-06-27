const cloudinaryService = require('../../services/storage/cloudinary');
const { authenticateToken } = require('../../middleware/auth/auth');

/**
 * Upload image to Cloudinary
 * POST /api/upload/image
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const { type = 'posts', transformation } = req.body;

    let result;
    if (type === 'avatar') {
      result = await cloudinaryService.uploadAvatarImage(req.file.buffer, userId);
    } else if (type === 'post') {
      result = await cloudinaryService.uploadPostImage(req.file.buffer, userId);
    } else {
      result = await cloudinaryService.uploadUserImage(req.file.buffer, userId, type);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Upload failed'
    });
  }
};

/**
 * Delete image from Cloudinary
 * DELETE /api/upload/image/:publicId
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinaryService.deleteImage(publicId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Delete failed'
    });
  }
};

/**
 * Generate optimized URLs for an image
 * GET /api/upload/urls/:publicId
 */
const generateUrls = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { size = 'medium' } = req.query;

    let urls;
    if (size === 'all') {
      urls = cloudinaryService.generateResponsiveUrls(publicId);
    } else {
      urls = {
        [size]: cloudinaryService.generateOptimizedUrl(publicId, size)
      };
    }

    res.json({
      success: true,
      data: urls
    });
  } catch (error) {
    console.error('URL generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'URL generation failed'
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  generateUrls
}; 