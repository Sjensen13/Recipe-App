import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/client';
import { useCloudinary } from '../../hooks/useCloudinary';
import { runSystemCheck } from '../../utils/checkConfig';

const CreatePost = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [systemStatus, setSystemStatus] = useState(null);
  const { uploading, error, uploadPostImage, clearError } = useCloudinary();

  // Debug: Log configuration to console
  useEffect(() => {
    const checkConfig = async () => {
      try {
        // Run comprehensive system check
        const status = await runSystemCheck(supabase);
        setSystemStatus(status);
        
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase session:', data.session);
        console.log('Cloudinary config:', {
          cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
          uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ? 'Set' : 'Missing'
        });
        
        setDebugInfo(`Session: ${data.session ? 'Active' : 'None'}, Cloudinary: ${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Missing'}`);
        
        if (error) {
          console.error('Session error:', error);
        }
      } catch (err) {
        console.error('Config error:', err);
      }
    };
    
    checkConfig();
  }, []);

  // Handle file input change and upload to Cloudinary
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    clearError();

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return;
    }

    // ✅ Get current user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user);
    if (userError || !user) {
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
    }
  };

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
        Create Post
      </h1>
      
      {/* Debug info */}
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        borderRadius: '8px', 
        padding: '1rem', 
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#374151'
      }}>
        <strong>Debug Info:</strong> {debugInfo}
        
        {systemStatus && (
          <div style={{ marginTop: '1rem' }}>
            <strong>System Status:</strong>
            <div style={{ marginTop: '0.5rem' }}>
              <div>Configuration: {systemStatus.config.cloudinary.status === '✅' && systemStatus.config.supabase.status === '✅' ? '✅ Ready' : '❌ Issues Found'}</div>
              <div>Authentication: {systemStatus.isAuthenticated ? '✅ Logged In' : '❌ Login Required'}</div>
              <div>Overall: {systemStatus.ready ? '✅ Ready to Upload' : '❌ Setup Required'}</div>
            </div>
            
            {!systemStatus.ready && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                <strong>🔧 Setup Required:</strong>
                {systemStatus.config.cloudinary.status !== '✅' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Cloudinary:</strong> Follow the setup guide in CLOUDINARY_SETUP.md
                  </div>
                )}
                {!systemStatus.isAuthenticated && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Authentication:</strong> Please log in to upload images
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Create post form will go here */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        padding: '1.5rem' 
      }}>
        <form>
          <label style={{ display: 'block', marginBottom: '1rem', color: '#374151' }}>
            Upload an image:
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={uploading}
              style={{ display: 'block', marginTop: '0.5rem' }}
            />
          </label>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Supported formats: JPG, PNG, GIF, WebP. Maximum size: 5MB.
          </p>
          {uploading && <p style={{ color: '#2563eb' }}>Uploading to Cloudinary...</p>}
          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '6px', 
              padding: '0.75rem', 
              marginBottom: '1rem',
              color: '#dc2626'
            }}>
              <strong>Error:</strong> {error}
              {error.includes('Cloudinary not configured') && (
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
          {imageUrl && (
            <div style={{ marginTop: '1rem' }}>
              <img src={imageUrl} alt="Preview" style={{ maxWidth: 200, borderRadius: 8 }} />
              <p style={{ color: '#16a34a', marginTop: '0.5rem' }}>Image uploaded successfully to Cloudinary!</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>URL: {imageUrl}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 