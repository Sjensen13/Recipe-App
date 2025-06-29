import React, { useState, useEffect } from 'react';
import { getPopularHashtags } from '../../services/api/search';
import LoadingSpinner from '../ui/LoadingSpinner';

const PopularHashtags = ({ onHashtagClick }) => {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularHashtags = async () => {
      try {
        setLoading(true);
        const response = await getPopularHashtags({ limit: 10 });
        if (response.success) {
          setHashtags(response.data);
        } else {
          setError('Failed to load popular hashtags');
        }
      } catch (err) {
        console.error('Error fetching popular hashtags:', err);
        setError('Failed to load popular hashtags');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularHashtags();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔥 Popular Hashtags
        </h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || hashtags.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔥 Popular Hashtags
        </h3>
        <div className="text-center py-8 text-gray-500">
          {error || 'No popular hashtags available'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔥 Popular Hashtags
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {hashtags.map((hashtag, index) => (
          <button
            key={index}
            onClick={() => onHashtagClick(hashtag.tag)}
            className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 group"
          >
            <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
              #{hashtag.tag}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {hashtag.count.toLocaleString()} posts
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularHashtags; 