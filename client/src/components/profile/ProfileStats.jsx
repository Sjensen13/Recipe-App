import React from 'react';

const ProfileStats = ({ stats = {}, onFollowersClick, onFollowingClick }) => {
  const { posts = 0, followers = 0, following = 0 } = stats;

  const statItems = [
    { 
      label: 'posts', 
      count: posts,
      onClick: null // Posts don't need click handler
    },
    { 
      label: 'followers', 
      count: followers,
      onClick: onFollowersClick
    },
    { 
      label: 'following', 
      count: following,
      onClick: onFollowingClick
    }
  ];

  return (
    <div className="flex gap-6 text-sm text-gray-600">
      {statItems.map((item) => (
        <div 
          key={item.label} 
          className={`transition-colors ${
            item.onClick 
              ? 'cursor-pointer hover:text-gray-900' 
              : ''
          }`}
          onClick={item.onClick}
        >
          <span className="font-semibold">{item.count}</span> {item.label}
        </div>
      ))}
    </div>
  );
};

export default ProfileStats; 