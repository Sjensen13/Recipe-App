import { useState, useCallback } from 'react';
import cloudinaryClient from '../services/cloudinary/client';

export const useCloudinary = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = useCallback(async (file, options = {}) => {
    setUploading(true);
    setError(null);

    try {
      const result = await cloudinaryClient.uploadImage(file, options);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadPostImage = useCallback(async (file, userId, options = {}) => {
    setUploading(true);
    setError(null);

    try {
      const result = await cloudinaryClient.uploadPostImage(file, userId, options);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadAvatarImage = useCallback(async (file, userId, options = {}) => {
    setUploading(true);
    setError(null);

    try {
      const result = await cloudinaryClient.uploadAvatarImage(file, userId, options);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const generateOptimizedUrl = useCallback((publicId, size = 'medium') => {
    try {
      return cloudinaryClient.generateOptimizedUrl(publicId, size);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const generateResponsiveUrls = useCallback((publicId) => {
    try {
      return cloudinaryClient.generateResponsiveUrls(publicId);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const extractPublicId = useCallback((url) => {
    return cloudinaryClient.extractPublicId(url);
  }, []);

  const isCloudinaryUrl = useCallback((url) => {
    return cloudinaryClient.isCloudinaryUrl(url);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    error,
    uploadImage,
    uploadPostImage,
    uploadAvatarImage,
    generateOptimizedUrl,
    generateResponsiveUrls,
    extractPublicId,
    isCloudinaryUrl,
    clearError
  };
}; 