# Cloudinary Setup Guide

This guide explains how to set up Cloudinary for image storage in your Recipe App, replacing Supabase Storage.

## Why Cloudinary?

Cloudinary offers several advantages over Supabase Storage:
- **Automatic image optimization** and format conversion
- **Responsive images** with multiple sizes
- **Advanced transformations** (crop, resize, filters, etc.)
- **CDN delivery** for faster loading
- **Face detection** for avatar cropping
- **Automatic WebP/AVIF conversion** for modern browsers

## Setup Steps

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. Verify your email address
3. Note down your **Cloud Name**, **API Key**, and **API Secret** from the dashboard

### 2. Create Upload Preset

1. In your Cloudinary dashboard, go to **Settings > Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Name**: `recipe-app-uploads` (or any name you prefer)
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `recipe-app` (optional, for organization)
   - **Allowed formats**: `jpg, png, gif, webp`
   - **Max file size**: `5MB`
5. Click **Save**

### 3. Environment Variables

#### Client (.env)
```env
# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=recipe-app-uploads
```

#### Server (.env)
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Install Dependencies

The Cloudinary package is already installed on the server. If you need to install it manually:

```bash
# Server
cd server
npm install cloudinary

# Client (no additional packages needed - uses fetch API)
```

## How It Works

### Client-Side Uploads

The app now uses direct client-side uploads to Cloudinary for better performance:

```javascript
// Example: Upload post image
const result = await cloudinaryClient.uploadPostImage(file, userId);
console.log(result.url); // Optimized image URL
```

### Server-Side Uploads

For cases requiring server-side processing, use the API endpoints:

```javascript
// Example: Upload via server
const formData = new FormData();
formData.append('image', file);
formData.append('type', 'post');

const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Image Transformations

### Post Images
- **Size**: Max 1200x800 (maintains aspect ratio)
- **Format**: Auto-converted to WebP/AVIF for modern browsers
- **Quality**: Auto-optimized
- **Folder**: `recipe-app/posts/{userId}`

### Avatar Images
- **Size**: 400x400 (square, face-focused crop)
- **Format**: Auto-converted to WebP/AVIF
- **Quality**: Auto-optimized
- **Folder**: `recipe-app/avatars/{userId}`

### Responsive Images

Generate multiple sizes for responsive design:

```javascript
const urls = cloudinaryClient.generateResponsiveUrls(publicId);
// Returns: { thumbnail, small, medium, large, original }
```

## API Endpoints

### Upload Image
```
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- image: File
- type: 'post' | 'avatar' | 'posts' (optional)
```

### Delete Image
```
DELETE /api/upload/image/:publicId
Authorization: Bearer <token>
```

### Generate URLs
```
GET /api/upload/urls/:publicId?size=medium
```

## Migration from Supabase Storage

### 1. Update Components

The following components have been updated to use Cloudinary:
- `CreatePost.jsx` - Post image uploads
- `Profile.jsx` - Avatar uploads
- `Avatar.jsx` - Avatar display

### 2. Database Updates

If you have existing image URLs in your database, you may want to:
1. Keep existing Supabase URLs for backward compatibility
2. Gradually migrate to Cloudinary URLs
3. Update the database schema to include Cloudinary public IDs

### 3. Cleanup

After migration, you can:
1. Delete the Supabase Storage bucket
2. Remove Supabase Storage RLS policies
3. Remove Supabase Storage environment variables

## Testing

### 1. Test Client Uploads

1. Start your development server
2. Go to Create Post page
3. Upload an image
4. Check the browser console for success messages
5. Verify the image appears in your Cloudinary dashboard

### 2. Test Avatar Uploads

1. Go to your profile page
2. Click the avatar upload button
3. Select an image
4. Verify the avatar updates

### 3. Test Server Uploads

```bash
# Test server upload endpoint
curl -X POST http://localhost:5001/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg" \
  -F "type=post"
```

## Troubleshooting

### Common Issues

1. **"Cloudinary not configured"**
   - Check environment variables are set correctly
   - Restart your development server after changing .env

2. **"Upload preset not found"**
   - Verify the upload preset name matches exactly
   - Check the preset is set to "Unsigned" mode

3. **"File size too large"**
   - Check the file size limit in your upload preset
   - Verify the client-side validation

4. **"Invalid file type"**
   - Check allowed formats in your upload preset
   - Verify the file is actually an image

### Debug Steps

1. **Check Environment Variables:**
   ```javascript
   console.log('Cloudinary config:', {
     cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
     uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
   });
   ```

2. **Check Upload Response:**
   ```javascript
   const result = await cloudinaryClient.uploadImage(file);
   console.log('Upload result:', result);
   ```

3. **Check Network Tab:**
   - Open browser dev tools
   - Go to Network tab
   - Upload an image
   - Check the request to Cloudinary API

## Security Best Practices

1. **Upload Preset Security:**
   - Use unsigned uploads for client-side uploads
   - Set appropriate file size and format limits
   - Use folder organization for better management

2. **Server-Side Validation:**
   - Always validate file types and sizes on the server
   - Use authentication for server-side uploads
   - Implement rate limiting for upload endpoints

3. **URL Security:**
   - Use HTTPS URLs (secure_url from Cloudinary)
   - Consider using signed URLs for private images
   - Implement proper access controls

## Performance Optimization

1. **Lazy Loading:**
   ```javascript
   <img 
     src={imageUrl} 
     loading="lazy" 
     alt="Post image" 
   />
   ```

2. **Responsive Images:**
   ```javascript
   <picture>
     <source srcSet={urls.webp} type="image/webp" />
     <source srcSet={urls.jpg} type="image/jpeg" />
     <img src={urls.fallback} alt="Post image" />
   </picture>
   ```

3. **Progressive Loading:**
   - Use Cloudinary's progressive JPEG format
   - Implement blur-up loading effects

## Cost Considerations

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month

For production apps, consider:
- Monitoring usage in Cloudinary dashboard
- Implementing image optimization strategies
- Using appropriate image sizes for different contexts

## Next Steps

1. **Set up monitoring** for Cloudinary usage
2. **Implement image optimization** strategies
3. **Add image compression** for large uploads
4. **Consider implementing** image galleries with Cloudinary
5. **Add video upload** support if needed

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary API Reference](https://cloudinary.com/documentation/admin_api)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images) 