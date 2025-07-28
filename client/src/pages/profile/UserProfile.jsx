import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { userService } from '../../services/api/user';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import FollowersList from '../../components/profile/FollowersList';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';
import { getUserPosts } from '../../services/api/posts';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    if (userId) {
      // Check if user is trying to view their own profile
      if (currentUser && userId === currentUser.id) {
        // Redirect to own profile
        navigate('/app/profile');
        return;
      }
      
      fetchProfile();
      fetchUserPosts();
      fetchFollowData();
    }
  }, [userId, currentUser?.id]);

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
      
      const response = await userService.getUserById(userId);
      const userData = response.data?.user || response.data;
      setProfile(userData);
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
      if (!userId) {
        setUserPosts([]);
        setPostsLoading(false);
        return;
      }
      const response = await getUserPosts(userId);
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
      // Fetch followers and following counts
      // This would be implemented based on your API
      setFollowersCount(0); // Placeholder
      setFollowingCount(0); // Placeholder
      
      // Check if current user is following this user
      if (currentUser && userId) {
        // This would be implemented based on your API
        setIsFollowing(false); // Placeholder
      }
    } catch (err) {
      console.error('Follow data fetch error:', err);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      showToast('Please log in to follow users', 'error');
      return;
    }

    try {
      setFollowLoading(true);
      // This would be implemented based on your API
      // const response = await followUser(userId);
      setIsFollowing(!isFollowing);
      showToast(
        isFollowing ? 'Unfollowed successfully' : 'Followed successfully', 
        'success'
      );
    } catch (err) {
      showToast('Failed to follow/unfollow user', 'error');
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
          isOwnProfile={false}
          isEditing={false}
          editForm={{}}
          uploadingAvatar={false}
          stats={{
            posts: userPosts.length,
            followers: followersCount,
            following: followingCount
          }}
          onEditClick={() => {}}
          onEditSubmit={() => {}}
          onEditCancel={() => {}}
          onFormChange={() => {}}
          onAvatarUpload={() => {}}
          onSignout={() => {}}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollow={handleFollow}
          onFollowersClick={handleFollowersClick}
          onFollowingClick={handleFollowingClick}
        />

        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOwnProfile={false}
          onNavigate={navigate}
          userPosts={userPosts}
          postsLoading={postsLoading}
          postsError={postsError}
          likedPosts={[]}
          likedPostsLoading={false}
          likedPostsError={null}
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

export default UserProfile; 