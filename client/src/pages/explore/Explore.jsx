import React from 'react';

const Explore = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Explore</h1>
      
      {/* Explore content will go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Discover new recipes and food creators here.</p>
        </div>
      </div>
    </div>
  );
};

export default Explore; 