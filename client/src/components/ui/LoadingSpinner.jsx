import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeMap = {
    sm: { width: '24px', height: '24px' },
    md: { width: '48px', height: '48px' },
    lg: { width: '64px', height: '64px' },
    xl: { width: '96px', height: '96px' }
  };

  const spinnerStyle = {
    ...sizeMap[size],
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '2rem' 
    }}>
      <div style={spinnerStyle}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 