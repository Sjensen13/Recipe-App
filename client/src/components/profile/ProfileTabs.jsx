import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import { likePost, addComment, getPost } from '../../services/api/posts';
import { useAuth } from '../../context/auth/AuthContext';

const ProfileTabs = ({ 
  activeTab, 
  setActiveTab, 
  isOwnProfile, 
  onNavigate,
  userPosts,
  postsLoading,
  postsError,
  fetchUserPosts
}) => {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'recipes', label: 'Recipes', icon: '🍳' },
    { id: 'likes', label: 'Likes', icon: '❤️' },
    { id: 'saved', label: 'Saved', icon: '��' }
  ];

  const [commentInput, setCommentInput] = React.useState('');
  const [showCommentInputId, setShowCommentInputId] = React.useState(null);
  const [likesState, setLikesState] = React.useState({});
  const [commentsState, setCommentsState] = React.useState({});

  const { user } = useAuth();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        if (postsLoading) {
          return <div className="mt-8"><LoadingSpinner /></div>;
        } else if (postsError) {
          return <div className="mt-8"><ErrorState message={postsError} onRetry={fetchUserPosts} /></div>;
        } else if (userPosts.length === 0) {
          return (
            <div className="mt-8 bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">
                {isOwnProfile
                  ? "Share your first post with the community!"
                  : "This user hasn't posted anything yet."}
              </p>
              {isOwnProfile && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => onNavigate('/app/create-post')}
                >
                  Create Post
                </button>
              )}
            </div>
          );
        } else {
          return (
            <div className="mt-8 flex flex-col gap-6">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-3 p-4 border-b">
                    <img
                      src={post.users?.avatar_url || require('../../assets/images/default-avatar.png')}
                      alt={post.users?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <button
                        className="font-semibold text-gray-900 hover:underline focus:outline-none"
                        onClick={() => onNavigate(`/app/profile/${post.users?.id}`)}
                      >
                        {post.users?.name || 'Unknown User'}
                      </button>
                      <div className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {/* Post Image */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  {/* Post Content */}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    <p className="text-gray-700 mb-2">{post.content}</p>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.hashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Post Stats */}
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        className="text-red-500 focus:outline-none"
                        onClick={() => handleLike(post.id)}
                      >
                        ❤ {(likesState[post.id] || post.likes || []).length}
                      </button>
                      <button
                        className="text-blue-500 focus:outline-none"
                        onClick={() => handleComment(post.id)}
                      >
                        💬 {(commentsState[post.id] || post.comments || []).length}
                      </button>
                    </div>
                    {showCommentInputId === post.id && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <input
                          value={commentInput}
                          onChange={e => setCommentInput(e.target.value)}
                          placeholder="Write a comment..."
                        />
                        <button onClick={() => handleAddComment(post.id)}>Submit</button>
                        <button onClick={() => setShowCommentInputId(null)}>Cancel</button>
                      </div>
                    )}
                    <button
                      className="text-blue-600 hover:underline mt-2 block"
                      onClick={() => onNavigate(`/app/post/${post.id}`)}
                    >
                      View Post →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        }
      case 'recipes':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
            <p className="text-gray-600 mb-4">
              {isOwnProfile 
                ? "Share your first recipe with the community!"
                : "This user hasn't shared any recipes yet."
              }
            </p>
            {isOwnProfile && (
              <button 
                onClick={() => onNavigate('/app/recipe-search')}
                className="btn-primary"
              >
                Create Recipe
              </button>
            )}
          </div>
        );
      case 'likes':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No likes yet</h3>
            <p className="text-gray-600">
              {isOwnProfile 
                ? "Posts you like will appear here."
                : "This user hasn't liked any posts yet."
              }
            </p>
          </div>
        );
      case 'saved':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved items</h3>
            <p className="text-gray-600">
              {isOwnProfile 
                ? "Posts you save will appear here."
                : "This user hasn't saved any posts yet."
              }
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const fetchAndSetPost = async (postId) => {
    const response = await getPost(postId);
    if (typeof fetchUserPosts === 'function') {
      fetchUserPosts();
    }
    setLikesState(prev => ({ ...prev, [postId]: response.data.likes || [] }));
    setCommentsState(prev => ({ ...prev, [postId]: response.data.comments || [] }));
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      await fetchAndSetPost(postId);
    } catch (err) {
      alert('Failed to like post');
    }
  };

  const handleComment = (postId) => {
    setShowCommentInputId(postId);
  };

  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;
    try {
      await addComment(postId, commentInput);
      await fetchAndSetPost(postId);
      setCommentInput('');
      setShowCommentInputId(null);
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  return (
    <div className="card">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileTabs; 