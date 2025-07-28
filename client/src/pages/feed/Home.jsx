import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getPosts, likePost, addComment, getPost } from '../../services/api/posts';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../context/auth/AuthContext';
import PostCard from '../../components/post/PostCard';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const navigate = useNavigate();

  // Get hashtag filter from URL params
  const hashtagFilter = searchParams.get('hashtag');

  // Fetch posts on component mount and when hashtag filter changes
  useEffect(() => {
    fetchPosts();
  }, [hashtagFilter]);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { page, limit: pagination.limit };
      if (hashtagFilter) {
        params.hashtag = hashtagFilter;
      }
      
      const response = await getPosts(params);
      
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

  // Handler for hashtag clicks
  const handleHashtagClick = (hashtag) => {
    setSearchParams({ hashtag });
  };

  // Handler to clear hashtag filter
  const clearHashtagFilter = () => {
    setSearchParams({});
  };

  // Handler stubs for profile, like, and comment
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
          {hashtagFilter ? `Posts tagged #${hashtagFilter}` : 'Your Feed'}
        </h1>
        {hashtagFilter && (
          <button
            onClick={clearHashtagFilter}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Clear Filter
          </button>
        )}
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
            {hashtagFilter ? `No posts with #${hashtagFilter}` : 'No posts yet'}
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            {hashtagFilter 
              ? `Be the first to share a post with #${hashtagFilter}!`
              : 'Be the first to share a delicious recipe or food story!'
            }
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
            <PostCard
              key={post.id}
              post={post}
              formatDate={formatDate}
              onProfileClick={handleProfileClick}
              onHashtagClick={handleHashtagClick}
              onLike={handleLike}
              onComment={handleComment}
              onAddComment={handleAddComment}
              showCommentInputId={showCommentInputId}
              commentInput={commentInput}
              setCommentInput={setCommentInput}
              setShowCommentInputId={setShowCommentInputId}
              likesState={likesState}
              commentsState={commentsState}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 