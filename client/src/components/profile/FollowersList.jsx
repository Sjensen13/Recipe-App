import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { userService } from '../../services/api/user';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import Toast from '../ui/Toast';

const FollowersList = ({ userId, type = 'followers', onClose }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [followStates, setFollowStates] = useState({});
  const [followLoading, setFollowLoading] = useState({});
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  const isOwnProfile = !userId || userId === 'me' || (currentUser && currentUser.id === userId);

  useEffect(() => {
    fetchUsers();
  }, [userId, type, currentPage]);

  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const targetUserId = userId === 'me' ? currentUser?.id : userId;
      const response = type === 'followers' 
        ? await userService.getFollowersList(targetUserId, currentPage)
        : await userService.getFollowingList(targetUserId, currentPage);
      
      const userList = type === 'followers' 
        ? response.data.followers
        : response.data.following;

      setUsers(userList);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);

      // Initialize follow states for all users
      const newFollowStates = {};
      const newFollowLoading = {};
      userList.forEach(user => {
        newFollowStates[user.id] = false; // Will be updated by checkIsFollowing
        newFollowLoading[user.id] = false;
      });
      setFollowStates(newFollowStates);
      setFollowLoading(newFollowLoading);

      // Check follow status for each user
      if (currentUser) {
        await Promise.all(
          userList.map(async (user) => {
            try {
              const followResponse = await userService.checkIsFollowing(user.id);
              setFollowStates(prev => ({
                ...prev,
                [user.id]: followResponse.data.isFollowing
              }));
            } catch (err) {
              console.error(`Failed to check follow status for user ${user.id}:`, err);
            }
          })
        );
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!currentUser) {
      showToast('Please log in to follow users', 'error');
      return;
    }

    try {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
      
      const isFollowing = followStates[targetUserId];
      
      if (isFollowing) {
        await userService.unfollowUser(targetUserId);
        setFollowStates(prev => ({ ...prev, [targetUserId]: false }));
        showToast('Unfollowed successfully', 'success');
      } else {
        await userService.followUser(targetUserId);
        setFollowStates(prev => ({ ...prev, [targetUserId]: true }));
        showToast('Followed successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update follow status', 'error');
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/app/profile/${userId}`);
    onClose();
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading && users.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <ErrorState
            message={error}
            onRetry={fetchUsers}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {type} ({totalCount})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Users List */}
          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {type} yet
                </h3>
                <p className="text-gray-600">
                  {isOwnProfile 
                    ? `You don't have any ${type} yet.`
                    : `This user doesn't have any ${type} yet.`
                  }
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <Avatar
                        src={user.avatar_url}
                        alt={user.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {user.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          @{user.username || 'unknown'}
                        </p>
                        {user.followedAt && (
                          <p className="text-xs text-gray-400">
                            {type === 'followers' ? 'Followed you ' : 'Followed '}
                            {formatDate(user.followedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!isOwnProfile && currentUser && user.id !== currentUser.id && (
                      <button
                        onClick={() => handleFollow(user.id)}
                        disabled={followLoading[user.id]}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          followStates[user.id]
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        } ${followLoading[user.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {followLoading[user.id] 
                          ? '...' 
                          : (followStates[user.id] ? 'Unfollow' : 'Follow')
                        }
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Load More Button */}
                {currentPage < totalPages && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="btn-secondary"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
};

export default FollowersList; 