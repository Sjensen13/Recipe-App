import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, likePost, addComment, getPost } from '../../services/api/posts';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../context/auth/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [commentInput, setCommentInput] = useState('');
  const [showCommentInputId, setShowCommentInputId] = useState(null);
  const [likesState, setLikesState] = useState({});
  const [commentsState, setCommentsState] = useState({});
  const { user } = useAuth();

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPosts({ page, limit: pagination.limit });
      
      if (response.success) {
        setPosts(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const fetchAndSetPost = async (postId) => {
    const response = await getPost(postId);
    setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, ...response.data } : p));
    setLikesState(prev => ({ ...prev, [postId]: response.data.likes || [] }));
    setCommentsState(prev => ({ ...prev, [postId]: response.data.comments || [] }));
  };

  // Handler stubs for profile, like, and comment
  const handleProfileClick = (userId) => {
    // TODO: Implement navigation to user profile
    window.location.href = `/app/profile/${userId}`;
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

  if (loading) {
    return (
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '1rem' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '1rem' }}>
        <ErrorState 
          message={error}
          onRetry={() => fetchPosts()}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
          Your Feed
        </h1>
        <Link 
          to="/app/create-post"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Create Post
        </Link>
      </div>
      
      {posts.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          padding: '3rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No posts yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Be the first to share a delicious recipe or food story!
          </p>
          <Link 
            to="/app/create-post"
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block'
            }}
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map((post) => (
            <div 
              key={post.id}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                overflow: 'hidden',
              }}
            >
              {/* Post Header */}
              <div style={{ padding: '1.5rem 1.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <img 
                    src={post.users?.avatar_url || require('../../assets/images/default-avatar.png')} 
                    alt={post.users?.name || 'User'}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <button
                      style={{ fontWeight: '600', color: '#111827', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                      onClick={() => handleProfileClick(post.users?.id)}
                    >
                      {post.users?.name || 'Unknown User'}
                    </button>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                </div>
                
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '0.5rem',
                  lineHeight: '1.4'
                }}>
                  {post.title}
                </h2>
              </div>

              {/* Post Image */}
              {post.image_url && (
                <div style={{ marginBottom: '1rem' }}>
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    style={{ 
                      width: '100%', 
                      height: '300px', 
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Post Content */}
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <p style={{ 
                  color: '#374151', 
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {post.content}
                </p>

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem', 
                    marginBottom: '1rem' 
                  }}>
                    {post.hashtags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Stats */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    onClick={() => handleLike(post.id)}
                  >
                    <span>❤️</span>
                    <span>{(likesState[post.id] || post.likes || []).length}</span>
                  </button>
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    onClick={() => handleComment(post.id)}
                  >
                    <span>💬</span>
                    <span>{(commentsState[post.id] || post.comments || []).length}</span>
                  </button>
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
                  <Link 
                    to={`/app/post/${post.id}`}
                    style={{
                      marginLeft: 'auto',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}
                  >
                    View Post →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 