const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth/auth');
const { uploadImage, deleteImage, generateUrls } = require('../controllers/upload');

const router = express.Router();

// Configure multer for memory storage (for Cloudinary uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter called with file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      encoding: file.encoding
    });
    
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      console.log('File accepted by multer');
      cb(null, true);
    } else {
      console.log('File rejected by multer - not an image');
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Upload image to Cloudinary
router.post('/image', authenticateToken, upload.single('image'), uploadImage);

// Delete image from Cloudinary
router.delete('/image/:publicId', authenticateToken, deleteImage);

// Generate optimized URLs
router.get('/urls/:publicId', generateUrls);

module.exports = router; 