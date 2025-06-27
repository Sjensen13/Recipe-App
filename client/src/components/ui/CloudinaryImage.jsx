import React, { useState } from 'react';
import cloudinaryClient from '../../services/cloudinary/client';

const CloudinaryImage = ({ 
  src, 
  alt, 
  size = 'medium',
  className = '',
  loading = 'lazy',
  fallback = null,
  onLoad,
  onError,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if it's a Cloudinary URL
  const isCloudinary = cloudinaryClient.isCloudinaryUrl(src);
  
  // Extract public ID from Cloudinary URL
  const publicId = isCloudinary ? cloudinaryClient.extractPublicId(src) : null;

  // Generate optimized URL if it's a Cloudinary image
  const getOptimizedUrl = () => {
    if (!isCloudinary || !publicId) {
      return src;
    }
    
    try {
      return cloudinaryClient.generateOptimizedUrl(publicId, size);
    } catch (error) {
      console.error('Error generating optimized URL:', error);
      return src;
    }
  };

  // Generate responsive URLs for picture element
  const getResponsiveUrls = () => {
    if (!isCloudinary || !publicId) {
      return null;
    }
    
    try {
      return cloudinaryClient.generateResponsiveUrls(publicId);
    } catch (error) {
      console.error('Error generating responsive URLs:', error);
      return null;
    }
  };

  const handleLoad = (e) => {
    setImageLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setImageError(true);
    if (onError) onError(e);
  };

  // If not a Cloudinary URL or error occurred, render simple img
  if (!isCloudinary || imageError) {
    return (
      <img
        src={fallback || src}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }

  const responsiveUrls = getResponsiveUrls();

  // If we have responsive URLs, use picture element
  if (responsiveUrls) {
    return (
      <picture>
        {/* WebP format for modern browsers */}
        <source 
          srcSet={responsiveUrls.medium} 
          type="image/webp" 
        />
        {/* Fallback to original format */}
        <img
          src={responsiveUrls.medium}
          alt={alt}
          className={className}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </picture>
    );
  }

  // Fallback to optimized single image
  return (
    <img
      src={getOptimizedUrl()}
      alt={alt}
      className={className}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default CloudinaryImage; 