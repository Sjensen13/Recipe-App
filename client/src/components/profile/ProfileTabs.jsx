import React from 'react';

const ProfileTabs = ({ 
  activeTab, 
  setActiveTab, 
  isOwnProfile, 
  onNavigate 
}) => {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'recipes', label: 'Recipes', icon: '🍳' },
    { id: 'likes', label: 'Likes', icon: '❤️' },
    { id: 'saved', label: 'Saved', icon: '🔖' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">
              {isOwnProfile 
                ? "Share your first post with the community!"
                : "This user hasn't posted anything yet."
              }
            </p>
            {isOwnProfile && (
              <button 
                onClick={() => onNavigate('/app/create-post')}
                className="btn-primary"
              >
                Create Post
              </button>
            )}
          </div>
        );

      case 'recipes':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
            <p className="text-gray-600 mb-4">
              {isOwnProfile 
                ? "Share your first recipe with the community!"
                : "This user hasn't shared any recipes yet."
              }
            </p>
            {isOwnProfile && (
              <button 
                onClick={() => onNavigate('/app/recipe-search')}
                className="btn-primary"
              >
                Create Recipe
              </button>
            )}
          </div>
        );

      case 'likes':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No likes yet</h3>
            <p className="text-gray-600">
              {isOwnProfile 
                ? "Posts you like will appear here."
                : "This user hasn't liked any posts yet."
              }
            </p>
          </div>
        );

      case 'saved':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved items</h3>
            <p className="text-gray-600">
              {isOwnProfile 
                ? "Posts you save will appear here."
                : "This user hasn't saved any posts yet."
              }
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileTabs; 