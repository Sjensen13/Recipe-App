import React from 'react';
import { useParams } from 'react-router-dom';

const PostDetail = () => {
  const { postId } = useParams();

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
        Post Detail
      </h1>
      
      {/* Post detail content will go here */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        padding: '1.5rem' 
      }}>
        <p style={{ color: '#6b7280' }}>
          Post detail page for post: {postId}
        </p>
      </div>
    </div>
  );
};

export default PostDetail; 