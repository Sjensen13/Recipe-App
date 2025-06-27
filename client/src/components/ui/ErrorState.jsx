import React from 'react';

const ErrorState = ({ 
  message = 'Something went wrong', 
  onRetry, 
  onNavigate, 
  navigateText = 'Go Home',
  navigatePath = '/'
}) => {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
      padding: '3rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
      <p style={{ color: '#dc2626', marginBottom: '2rem', fontSize: '1.125rem' }}>{message}</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {onRetry && (
          <button 
            onClick={onRetry}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Try Again
          </button>
        )}
        {onNavigate && (
          <button 
            onClick={() => onNavigate(navigatePath)}
            style={{
              backgroundColor: 'white',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            {navigateText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState; 