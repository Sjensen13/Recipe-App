import React from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { userId } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      
      {/* Profile content will go here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Profile page for user: {userId}</p>
      </div>
    </div>
  );
};

export default Profile; 