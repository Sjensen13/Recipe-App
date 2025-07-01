import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { userService } from '../../services/api/user';
import { useCloudinary } from '../../hooks/useCloudinary';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import FollowersList from '../../components/profile/FollowersList';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';
import { getUserPosts } from '../../services/api/posts';

const Profile = () => {
  const { userId } = useParams();
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);

  // Check if viewing own profile - computed value that updates when currentUser changes
  const isOwnProfile = !userId || userId === 'me' || (currentUser && currentUser.id === userId);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
    if (userId && currentUser) {
      fetchFollowData();
    }
  }, [userId, currentUser?.id]); // Depend on userId and currentUser.id changes

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
      
      let response;
      if (isOwnProfile) {
        // Fetch current user's profile
        response = await userService.getProfile();
      } else {
        // Fetch other user's profile
        response = await userService.getUserById(userId);
      }
      
      // Handle different response structures for own profile vs other user profile
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
      const id = userId && userId !== 'me' ? userId : currentUser?.id;
      if (!id) {
        setUserPosts([]);
        setPostsLoading(false);
        return;
      }
      const response = await getUserPosts(id);
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

  const fetchFollowData = async () => {
    try {
      // Determine the actual user ID to use
      const targetUserId = userId === 'me' ? currentUser?.id : userId;
      
      if (!targetUserId) {
        console.log('No target user ID available for follow data');
        return;
      }

      // Fetch follow status (only if not viewing own profile)
      if (!isOwnProfile) {
        const followResponse = await userService.checkIsFollowing(targetUserId);
        setIsFollowing(followResponse.data?.isFollowing || false);
      }

      // Fetch followers count
      const followersResponse = await userService.getFollowersCount(targetUserId);
      setFollowersCount(followersResponse.data?.followersCount || 0);

      // Fetch following count
      const followingResponse = await userService.getFollowingCount(targetUserId);
      setFollowingCount(followingResponse.data?.followingCount || 0);
    } catch (err) {
      console.error('Failed to fetch follow data:', err);
      console.error('Follow data error response:', err.response?.data);
      // Set defaults if fetch fails
      setIsFollowing(false);
      setFollowersCount(0);
      setFollowingCount(0);
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
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (file) => {
    try {
      const avatarUrl = await uploadAvatarImage(file);
      setEditForm(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));
      showToast('Avatar uploaded successfully', 'success');
    } catch (err) {
      showToast('Failed to upload avatar', 'error');
      console.error('Avatar upload error:', err);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to follow users', 'error');
      return;
    }

    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        // Unfollow user
        await userService.unfollowUser(userId);
        setIsFollowing(false);
        
        // When viewing someone else's profile, decrease their followers count
        if (!isOwnProfile) {
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
        
        showToast('Unfollowed successfully', 'success');
      } else {
        // Follow user
        await userService.followUser(userId);
        setIsFollowing(true);
        
        // When viewing someone else's profile, increase their followers count
        if (!isOwnProfile) {
          setFollowersCount(prev => prev + 1);
        }
        
        showToast('Followed successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update follow status', 'error');
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
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
        navigatePath="/"
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
          isOwnProfile={isOwnProfile}
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
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollow={handleFollow}
          onFollowersClick={handleFollowersClick}
          onFollowingClick={handleFollowingClick}
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

      {/* Followers List Modal */}
      {showFollowersList && (
        <FollowersList
          userId={userId}
          type="followers"
          onClose={handleCloseFollowersList}
        />
      )}

      {/* Following List Modal */}
      {showFollowingList && (
        <FollowersList
          userId={userId}
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

export default Profile; 