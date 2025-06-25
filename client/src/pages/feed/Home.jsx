import React from 'react';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Feed</h1>
      
      {/* Feed content will go here */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Your personalized feed will appear here, showing food posts from people you follow.</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 