import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPost } from '../../services/api/posts';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            <img 
              src={post.users?.avatar_url || 'https://via.placeholder.com/50x50?text=U'} 
              alt={post.users?.name || 'User'}
              style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '1.125rem' }}>
                {post.users?.name || 'Unknown User'}
              </div>
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
                <span 
                  key={index}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '0.5rem 1rem',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  #{tag}
                </span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
              <span style={{ fontSize: '1.25rem' }}>❤️</span>
              <span style={{ fontWeight: '500' }}>{post.likes?.length || 0} likes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
              <span style={{ fontSize: '1.25rem' }}>💬</span>
              <span style={{ fontWeight: '500' }}>{post.comments?.length || 0} comments</span>
            </div>
          </div>

          {/* Comments Section */}
          {post.comments && post.comments.length > 0 && (
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
                {post.comments.map((comment) => (
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
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 