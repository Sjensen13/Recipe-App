import React from 'react';

const CreatePost = () => {
  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
        Create Post
      </h1>
      
      {/* Create post form will go here */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        padding: '1.5rem' 
      }}>
        <p style={{ color: '#6b7280' }}>
          Create a new post form will appear here.
        </p>
      </div>
    </div>
  );
};

export default CreatePost; 