import React from 'react';

const Home = () => {
  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
        Your Feed
      </h1>
      
      {/* Feed content will go here */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          padding: '1.5rem' 
        }}>
          <p style={{ color: '#6b7280' }}>
            Your personalized feed will appear here, showing food posts from people you follow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 