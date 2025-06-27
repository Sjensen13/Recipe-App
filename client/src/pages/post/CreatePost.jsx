import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase/client';
import { useCloudinary } from '../../hooks/useCloudinary';
import { createPost } from '../../services/api/posts';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    hashtags: ''
  });
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { uploading, error, uploadPostImage, clearError } = useCloudinary();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input change and upload to Cloudinary
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    clearError();
    setSubmitError('');

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSubmitError('File size must be less than 5MB');
      return;
    }

    // Get current user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user);
    if (userError || !user) {
      setSubmitError('Please log in to upload images');
      return;
    }

    try {
      console.log('Attempting upload to Cloudinary...');

      // Upload to Cloudinary
      const result = await uploadPostImage(file, user.id);

      if (!result.success) {
        throw new Error('Upload failed');
      }

      console.log('Upload successful:', result);
      setImageUrl(result.url);
    } catch (err) {
      console.error('Upload error:', err);
      setSubmitError(err.message || 'Failed to upload image');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setSubmitError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please log in to create a post');
      }

      // Prepare post data
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        image_url: imageUrl || null,
        hashtags: formData.hashtags 
          ? formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : []
      };

      console.log('Creating post with data:', postData);

      // Create post
      const result = await createPost(postData);

      if (result.success) {
        console.log('Post created successfully:', result.data);
        
        // Redirect to the new post
        navigate(`/app/post/${result.data.id}`);
      } else {
        throw new Error(result.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setSubmitError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageUrl('');
    clearError();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
        padding: '2rem' 
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Create New Post
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontWeight: '500'
            }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your post title..."
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Content Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontWeight: '500'
            }}>
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Share your thoughts, recipe, or story..."
              required
              rows={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Hashtags Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontWeight: '500'
            }}>
              Hashtags (optional)
            </label>
            <input
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleInputChange}
              placeholder="recipe, cooking, food (comma separated)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Separate hashtags with commas
            </p>
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontWeight: '500'
            }}>
              Add Image
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={uploading}
              style={{ 
                display: 'block', 
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Supported formats: JPG, PNG, GIF, WebP. Maximum size: 5MB.
            </p>
          </div>

          {/* Upload Status */}
          {uploading && (
            <div style={{ 
              backgroundColor: '#eff6ff', 
              border: '1px solid #3b82f6', 
              borderRadius: '8px', 
              padding: '0.75rem', 
              marginBottom: '1rem',
              color: '#1d4ed8'
            }}>
              📤 Uploading image to Cloudinary...
            </div>
          )}

          {/* Image Preview */}
          {imageUrl && (
            <div style={{ 
              backgroundColor: '#f0fdf4', 
              border: '1px solid #22c55e', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }} 
                />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#16a34a', fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                    ✅ Image uploaded successfully!
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                    Your image is ready to be included in your post.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    background: 'none',
                    border: '1px solid #dc2626',
                    color: '#dc2626',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {(error || submitError) && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '8px', 
              padding: '0.75rem', 
              marginBottom: '1rem',
              color: '#dc2626'
            }}>
              <strong>Error:</strong> {error || submitError}
              {error && error.includes('Cloudinary not configured') && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <p>To fix this:</p>
                  <ol style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                    <li>Go to your Cloudinary dashboard</li>
                    <li>Create an upload preset</li>
                    <li>Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in your .env file</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/app/home')}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              style={{
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSubmitting ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 