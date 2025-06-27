import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../../services/api/posts';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

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
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Post Header */}
              <div style={{ padding: '1.5rem 1.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <img 
                    src={post.users?.avatar_url || 'https://via.placeholder.com/40x40?text=U'} 
                    alt={post.users?.name || 'User'}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      {post.users?.name || 'Unknown User'}
                    </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <span>❤️</span>
                    <span>{post.likes?.length || 0}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <span>💬</span>
                    <span>{post.comments?.length || 0}</span>
                  </div>
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