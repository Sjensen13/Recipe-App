import React from 'react';

const SearchTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'search',
      name: 'Search by Name',
      icon: '🔍',
      description: 'Search recipes by title or description'
    },
    {
      id: 'ingredients',
      name: 'Search by Ingredients',
      icon: '🥕',
      description: 'Upload a photo or add ingredients manually'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <div className="text-left">
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs opacity-75">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SearchTabs; 