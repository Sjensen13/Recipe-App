import React from 'react';
import { useParams } from 'react-router-dom';

const PostDetail = () => {
  const { postId } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post Detail</h1>
      
      {/* Post detail content will go here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Post detail page for post: {postId}</p>
      </div>
    </div>
  );
};

export default PostDetail; 