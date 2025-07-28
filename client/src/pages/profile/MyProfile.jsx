import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { userService } from '../../services/api/user';
import { useCloudinary } from '../../hooks/useCloudinary';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import FollowersList from '../../components/profile/FollowersList';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';
import { getUserPosts, getLikedPosts } from '../../services/api/posts';

const MyProfile = () => {
  const { user: currentUser, isAuthenticated, logout } = useAuth();
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
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedPostsLoading, setLikedPostsLoading] = useState(true);
  const [likedPostsError, setLikedPostsError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchUserPosts();
      fetchUserLikedPosts();
      fetchFollowData();
    }
  }, [currentUser?.id]);

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleSignout = async () => {
    try {
      await logout();
      showToast('Signed out successfully', 'success');
      navigate('/');
    } catch (error) {
      showToast('Failed to sign out', 'error');
      console.error('Signout error:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getProfile();
      const userData = response.data?.user || response.data;
      setProfile(userData);
      setEditForm({
        username: userData.username || userData.user_metadata?.username || '',
        name: userData.name || userData.user_metadata?.name || '',
        bio: userData.bio || userData.user_metadata?.bio || '',
        avatar_url: userData.avatar_url || userData.user_metadata?.avatar_url || ''
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      if (!currentUser?.id) {
        setUserPosts([]);
        setPostsLoading(false);
        return;
      }
      const response = await getUserPosts(currentUser.id);
      setUserPosts(response.data || []);
    } catch (err) {
      console.error('Posts fetch error:', err);
      console.error('Posts error response:', err.response?.data);
      setPostsError('Failed to load posts');
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchUserLikedPosts = async () => {
    try {
      setLikedPostsLoading(true);
      setLikedPostsError(null);
      if (!currentUser?.id) {
        setLikedPosts([]);
        setLikedPostsLoading(false);
        return;
      }
      const response = await getLikedPosts(currentUser.id);
      setLikedPosts(response.data || []);
    } catch (err) {
      console.error('Liked posts fetch error:', err);
      setLikedPostsError('Failed to load liked posts');
      setLikedPosts([]);
    } finally {
      setLikedPostsLoading(false);
    }
  };

  const fetchFollowData = async () => {
    try {
      // Fetch followers and following counts
      // This would be implemented based on your API
      setFollowersCount(0); // Placeholder
      setFollowingCount(0); // Placeholder
    } catch (err) {
      console.error('Follow data fetch error:', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(editForm);
      await fetchProfile();
      setIsEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
      console.error('Profile update error:', err);
    }
  };

  const handleFormChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarUpload = async (file) => {
    try {
      const result = await uploadAvatarImage(file);
      setEditForm(prev => ({
        ...prev,
        avatar_url: result.secure_url
      }));
      showToast('Avatar uploaded successfully', 'success');
    } catch (err) {
      showToast('Failed to upload avatar', 'error');
      console.error('Avatar upload error:', err);
    }
  };

  const handleFollowersClick = () => {
    setShowFollowersList(true);
  };

  const handleFollowingClick = () => {
    setShowFollowingList(true);
  };

  const handleCloseFollowersList = () => {
    setShowFollowersList(false);
  };

  const handleCloseFollowingList = () => {
    setShowFollowingList(false);
  };

  // Show upload error in toast if there is one
  useEffect(() => {
    if (uploadError) {
      showToast('Upload error: ' + uploadError, 'error');
    }
  }, [uploadError]);

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
        navigatePath="/app/home"
      />
    );
  }

  const userData = {
    id: profile.id,
    username: profile.username || profile.user_metadata?.username || 'No username',
    name: profile.name || profile.user_metadata?.name || 'No name',
    bio: profile.bio || profile.user_metadata?.bio || 'No bio yet',
    avatar_url: profile.avatar_url || profile.user_metadata?.avatar_url || '',
    email: profile.email,
    created_at: profile.created_at
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileHeader
          userData={userData}
          isOwnProfile={true}
          isEditing={isEditing}
          editForm={editForm}
          uploadingAvatar={uploadingAvatar}
          stats={{
            posts: userPosts.length,
            followers: followersCount,
            following: followingCount
          }}
          onEditClick={() => setIsEditing(true)}
          onEditSubmit={handleEditSubmit}
          onEditCancel={() => setIsEditing(false)}
          onFormChange={handleFormChange}
          onAvatarUpload={handleAvatarUpload}
          onSignout={handleSignout}
          isFollowing={false}
          followLoading={false}
          onFollow={() => {}}
          onFollowersClick={handleFollowersClick}
          onFollowingClick={handleFollowingClick}
        />

        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOwnProfile={true}
          onNavigate={navigate}
          userPosts={userPosts}
          postsLoading={postsLoading}
          postsError={postsError}
          likedPosts={likedPosts}
          likedPostsLoading={likedPostsLoading}
          likedPostsError={likedPostsError}
        />
      </div>

      {/* Followers List Modal */}
      {showFollowersList && (
        <FollowersList
          userId={currentUser?.id}
          type="followers"
          onClose={handleCloseFollowersList}
        />
      )}

      {/* Following List Modal */}
      {showFollowingList && (
        <FollowersList
          userId={currentUser?.id}
          type="following"
          onClose={handleCloseFollowingList}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default MyProfile; 