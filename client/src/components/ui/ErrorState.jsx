import React from 'react';

const ErrorState = ({ 
  message = 'Something went wrong', 
  onRetry, 
  onNavigate, 
  navigateText = 'Go Home',
  navigatePath = '/'
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="btn-primary"
            >
              Try Again
            </button>
          )}
          {onNavigate && (
            <button 
              onClick={() => onNavigate(navigatePath)}
              className="btn-secondary"
            >
              {navigateText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState; 