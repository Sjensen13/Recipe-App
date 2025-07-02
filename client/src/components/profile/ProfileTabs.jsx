import React, { useEffect } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import { likePost, addComment, getPost } from '../../services/api/posts';
import { useAuth } from '../../context/auth/AuthContext';
import PostCard from '../post/PostCard';

const ProfileTabs = ({ 
  activeTab, 
  setActiveTab, 
  isOwnProfile, 
  onNavigate,
  userPosts,
  postsLoading,
  postsError,
  fetchUserPosts,
  likedPosts,
  likedPostsLoading,
  likedPostsError
}) => {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'recipes', label: 'Recipes', icon: '🍳' },
    { id: 'likes', label: 'Likes', icon: '❤️' },
    { id: 'saved', label: 'Saved', icon: '' }
  ];

  const [commentInput, setCommentInput] = React.useState('');
  const [showCommentInputId, setShowCommentInputId] = React.useState(null);
  const [likesState, setLikesState] = React.useState({});
  const [commentsState, setCommentsState] = React.useState({});

  const { user } = useAuth();

  const fetchAndSetPost = async (postId) => {
    const response = await getPost(postId);
    // Update the post in the userPosts array
    if (userPosts) {
      const updatedPosts = userPosts.map(p => p.id === postId ? { ...p, ...response.data } : p);
      // You might need to add a callback to update the parent component's state
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

  // Handler for hashtag clicks
  const handleHashtagClick = (hashtag) => {
    onNavigate(`/app/home?hashtag=${hashtag}`);
  };

  useEffect(() => {
    if (activeTab === 'likes' && likedPosts && likedPosts.length > 0) {
      // Initialize likes and comments state for liked posts
      const newLikesState = {};
      const newCommentsState = {};
      likedPosts.forEach(post => {
        newLikesState[post.id] = post.likes || [];
        newCommentsState[post.id] = post.comments || [];
      });
      setLikesState(newLikesState);
      setCommentsState(newCommentsState);
    }
  }, [activeTab, likedPosts]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        if (postsLoading) {
          return <LoadingSpinner />;
        }
        
        if (postsError) {
          return (
            <ErrorState 
              message={postsError}
              onRetry={fetchUserPosts}
            />
          );
        }
        
        if (!userPosts || userPosts.length === 0) {
          return (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">
                {isOwnProfile 
                  ? "Share your first post with the community!"
                  : "This user hasn't shared any posts yet."
                }
              </p>
              {isOwnProfile && (
                <button 
                  onClick={() => onNavigate('/app/create-post')}
                  className="btn-primary"
                >
                  Create Post
                </button>
              )}
            </div>
          );
        }
        
        return (
          <div className="grid gap-4">
            {userPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow p-4">
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  {/* Post Image */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-72 object-cover rounded mb-2"
                    />
                  )}
                  {/* Post Content (remove hashtags from text) */}
                  <p className="text-gray-700 mb-2">
                    {post.content.replace(/#[\w]+/g, '').replace(/\s{2,}/g, ' ').trim()}
                  </p>
                  {/* Hashtags as buttons */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.hashtags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHashtagClick(tag)}
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </button>
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
                </div>
              </div>
            ))}
          </div>
        );
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
        if (likedPostsLoading) {
          return <LoadingSpinner />;
        }
        if (likedPostsError) {
          return (
            <ErrorState 
              message={likedPostsError}
              onRetry={null}
            />
          );
        }
        if (!likedPosts || likedPosts.length === 0) {
          return (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No liked posts yet</h3>
              <p className="text-gray-600 mb-4">
                {isOwnProfile 
                  ? "Start liking posts to see them here!"
                  : "This user hasn't liked any posts yet."
                }
              </p>
              {isOwnProfile && (
                <button 
                  onClick={() => onNavigate('/app/home')}
                  className="btn-primary"
                >
                  Explore Posts
                </button>
              )}
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {likedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                formatDate={date => new Date(date).toLocaleDateString()}
                onProfileClick={userId => onNavigate(`/app/profile/${userId}`)}
                onHashtagClick={handleHashtagClick}
                onLike={() => handleLike(post.id)}
                onComment={() => handleComment(post.id)}
                onAddComment={() => handleAddComment(post.id)}
                showCommentInputId={showCommentInputId}
                commentInput={commentInput}
                setCommentInput={setCommentInput}
                setShowCommentInputId={setShowCommentInputId}
                likesState={likesState}
                commentsState={commentsState}
              />
            ))}
          </div>
        );
      case 'saved':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved posts yet</h3>
            <p className="text-gray-600 mb-4">
              {isOwnProfile 
                ? "Save posts to view them later!"
                : "This user hasn't saved any posts yet."
              }
            </p>
            {isOwnProfile && (
              <button 
                onClick={() => onNavigate('/app/home')}
                className="btn-primary"
              >
                Explore Posts
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileTabs; 