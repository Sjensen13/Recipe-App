import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { userService } from '../../services/api/user';
import { useCloudinary } from '../../hooks/useCloudinary';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';
import { getUserPosts } from '../../services/api/posts';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { uploading: uploadingAvatar, error: uploadError, uploadAvatarImage, clearError } = useCloudinary();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    name: '',
    bio: '',
    avatar_url: ''
  });
  const [activeTab, setActiveTab] = useState('posts');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  // Check if viewing own profile
  const isOwnProfile = !userId || userId === 'me' || (currentUser && currentUser.id === userId);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getProfile();
      setProfile(response.data.user);
      setEditForm({
        username: response.data.user.username || response.data.user.user_metadata?.username || '',
        name: response.data.user.name || response.data.user.user_metadata?.name || '',
        bio: response.data.user.bio || response.data.user.user_metadata?.bio || '',
        avatar_url: response.data.user.avatar_url || response.data.user.user_metadata?.avatar_url || ''
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      const id = userId && userId !== 'me' ? userId : currentUser?.id;
      if (!id) {
        setUserPosts([]);
        setPostsLoading(false);
        return;
      }
      const response = await getUserPosts(id);
      setUserPosts(response.data || []);
    } catch (err) {
      setPostsError('Failed to load posts');
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.updateProfile(editForm);
      setProfile(prev => ({
        ...prev,
        ...editForm,
        user_metadata: {
          ...prev.user_metadata,
          ...editForm
        }
      }));
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
      console.error('Profile update error:', err);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      clearError();
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }

      // Upload to Cloudinary
      const result = await uploadAvatarImage(file, currentUser.id);
      
      if (!result.success) {
        throw new Error('Upload failed');
      }

      // Update the form with the new avatar URL
      setEditForm(prev => ({ ...prev, avatar_url: result.url }));
      showToast('Avatar uploaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to upload avatar: ' + err.message, 'error');
      console.error('Avatar upload error:', err);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Show upload error in toast if there is one
  useEffect(() => {
    if (uploadError) {
      showToast('Upload error: ' + uploadError, 'error');
    }
  }, [uploadError]);

  // Debug log for posts section
  console.log("Rendering posts section", { postsLoading, postsError, userPosts });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchProfile}
        onNavigate={navigate}
      />
    );
  }

  if (!profile) {
    return (
      <ErrorState
        message="Profile not found"
        onNavigate={navigate}
        navigateText="Go Home"
        navigatePath="/"
      />
    );
  }

  const userData = {
    username: profile.username || profile.user_metadata?.username || 'No username',
    name: profile.name || profile.user_metadata?.name || 'No name',
    bio: profile.bio || profile.user_metadata?.bio || 'No bio yet',
    avatar_url: profile.avatar_url || profile.user_metadata?.avatar_url || '',
    email: profile.email,
    created_at: profile.created_at
  };

  // Mock stats - in a real app, these would come from the API
  const userStats = {
    posts: 0,
    followers: 0,
    following: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileHeader
          userData={userData}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          editForm={editForm}
          uploadingAvatar={uploadingAvatar}
          stats={{
            posts: userPosts.length,
            followers: 0,
            following: 0
          }}
          onEditClick={() => setIsEditing(true)}
          onEditSubmit={handleEditSubmit}
          onEditCancel={() => setIsEditing(false)}
          onFormChange={handleFormChange}
          onAvatarUpload={handleAvatarUpload}
        />

        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOwnProfile={isOwnProfile}
          onNavigate={navigate}
          userPosts={userPosts}
          postsLoading={postsLoading}
          postsError={postsError}
        />
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default Profile; 