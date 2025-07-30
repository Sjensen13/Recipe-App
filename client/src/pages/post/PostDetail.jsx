import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, likePost, addComment } from '../../services/api/posts';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../context/auth/AuthContext';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatarUtils';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(post?.likes || []);
  const [comments, setComments] = useState(post?.comments || []);
  const [liked, setLiked] = useState(post?.likes?.some(like => like.user_id === 'me') || false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPost(postId);
      
      if (response.success) {
        setPost(response.data);
        setLikes(response.data.likes || []);
        setComments(response.data.comments || []);
        setLiked(response.data.likes?.some(like => like.user_id === user?.id));
      } else {
        throw new Error(response.message || 'Failed to fetch post');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProfileClick = (userId) => {
    if (userId === user?.id) {
      // Navigate to own profile
      navigate('/app/profile');
    } else {
      // Navigate to other user's profile
      navigate(`/app/profile/${userId}`);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await likePost(postId);
      if (res.liked) {
        setLikes([...likes, { user_id: user.id }]);
        setLiked(true);
      } else {
        setLikes(likes.filter(like => like.user_id !== user.id));
        setLiked(false);
      }
    } catch (err) {
      alert('Failed to like post');
    }
  };

  const handleComment = () => {
    setShowCommentInput(true);
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    try {
      await addComment(post.id, commentInput);
      await fetchPost();
      setCommentInput('');
      setShowCommentInput(false);
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  // Handler for hashtag clicks
  const handleHashtagClick = (hashtag) => {
    navigate(`/app/home?hashtag=${hashtag}`);
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
          onRetry={() => fetchPost()}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          padding: '3rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            Post not found
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/app/home"
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
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '1rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          to="/app/home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}
        >
          ← Back to Feed
        </Link>
      </div>

      {/* Post Card */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden'
      }}>
        {/* Post Header */}
        <div style={{ padding: '2rem 2rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => handleProfileClick(post.users?.id)}
            >
              <img 
                src={getAvatarUrl(post.users?.avatar_url, post.users?.id)} 
                alt={post.users?.name || 'User'}
                onError={(e) => handleAvatarError(e, post.users?.id)}
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </button>
            <div style={{ flex: 1 }}>
              <button
                style={{ fontWeight: '600', color: '#111827', fontSize: '1.125rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                onClick={() => handleProfileClick(post.users?.id)}
              >
                {post.users?.name || 'Unknown User'}
              </button>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {formatDate(post.created_at)}
              </div>
            </div>
          </div>
          
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '1rem',
            lineHeight: '1.3'
          }}>
            {post.title}
          </h1>
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src={post.image_url} 
              alt={post.title}
              style={{ 
                width: '100%', 
                height: '400px', 
                objectFit: 'cover'
              }}
            />
          </div>
        )}

        {/* Post Content */}
        <div style={{ padding: '0 2rem 2rem' }}>
          <div style={{ 
            color: '#374151', 
            lineHeight: '1.7',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            whiteSpace: 'pre-wrap'
          }}>
            {post.content}
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.75rem', 
              marginBottom: '2rem' 
            }}>
              {post.hashtags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleHashtagClick(tag)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '0.5rem 1rem',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Recipe Data */}
          {post.recipe_data && (
            <div style={{ 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px', 
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '1rem' 
              }}>
                Recipe Details
              </h3>
              <pre style={{ 
                color: '#374151', 
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                margin: 0
              }}>
                {JSON.stringify(post.recipe_data, null, 2)}
              </pre>
            </div>
          )}

          {/* Post Stats */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #f3f4f6'
          }}>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              onClick={() => handleLike(post.id)}
            >
              <span>❤️</span>
              
            </button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              onClick={handleComment}
            >
              <span>💬</span>
              
            </button>
          </div>

          {/* Comments Section */}
          {comments && comments.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '1rem' 
              }}>
                Comments
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.map((comment) => (
                  <div 
                    key={comment.id}
                    style={{ 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '8px', 
                      padding: '1rem' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#111827' }}>
                        {comment.users?.name || 'Unknown User'}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p style={{ color: '#374151', margin: 0 }}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showCommentInput && (
            <div style={{ marginTop: '0.5rem' }}>
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
              />
              <button onClick={handleAddComment}>Submit</button>
              <button onClick={() => setShowCommentInput(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 