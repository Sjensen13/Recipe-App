import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({
  post,
  formatDate,
  onProfileClick,
  onHashtagClick,
  onLike,
  onComment,
  onAddComment,
  showCommentInputId,
  commentInput,
  setCommentInput,
  setShowCommentInputId,
  likesState,
  commentsState
}) => {
  return (
    <div
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
              onClick={() => onProfileClick(post.users?.id)}
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
          {post.content.replace(/#[\w]+/g, '').replace(/\s{2,}/g, ' ').trim()}
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
              <button
                key={index}
                onClick={() => onHashtagClick(tag)}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={e => e.target.style.backgroundColor = '#f3f4f6'}
              >
                #{tag}
              </button>
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
            onClick={() => onLike(post.id)}
          >
            <span>❤️</span>
            <span>{(likesState[post.id] || post.likes || []).length}</span>
          </button>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            onClick={() => onComment(post.id)}
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
              <button onClick={() => onAddComment(post.id)}>Submit</button>
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
  );
};

export default PostCard; 