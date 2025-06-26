import React from 'react';

const ProfileStats = ({ stats = {} }) => {
  const { posts = 0, followers = 0, following = 0 } = stats;

  const statItems = [
    { label: 'posts', count: posts },
    { label: 'followers', count: followers },
    { label: 'following', count: following }
  ];

  return (
    <div className="flex gap-6 text-sm text-gray-600">
      {statItems.map((item) => (
        <div key={item.label} className="cursor-pointer hover:text-gray-900 transition-colors">
          <span className="font-semibold">{item.count}</span> {item.label}
        </div>
      ))}
    </div>
  );
};

export default ProfileStats; 