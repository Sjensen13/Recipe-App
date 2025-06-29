import React from 'react';

const FilterTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'recipes', label: 'Recipes', icon: '🍲' },
    { id: 'hashtags', label: 'Hashtags', icon: '#' }
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs; 