import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import PostCard from '../post/PostCard';

const SearchResults = ({ 
  results, 
  activeTab, 
  loading, 
  error, 
  searchQuery,
  onLoadMore 
}) => {

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState 
          message="Failed to load search results" 
          onRetry={() => onLoadMore && onLoadMore()}
        />
      </div>
    );
  }

  if (!searchQuery) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">
          🔍 Start searching to discover content
        </div>
        <p className="text-gray-500">
          Search for posts, users, or hashtags to get started
        </p>
      </div>
    );
  }

  // Improved no results check for all tabs
  if (!results || !results.data || results.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">
          No results found for "{searchQuery}"
        </div>
        <p className="text-gray-500">
          Try adjusting your search terms or browse different categories
        </p>
      </div>
    );
  }

  const renderPosts = () => {
    const posts = results.data;
    if (!posts || posts.length === 0) return null;

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            formatDate={(date) => new Date(date).toLocaleDateString()}
            onProfileClick={(userId) => window.location.href = `/app/profile/${userId}`}
            onHashtagClick={() => {}}
            onLike={() => {}}
            onComment={() => {}}
            onAddComment={() => {}}
            showCommentInputId={null}
            commentInput={''}
            setCommentInput={() => {}}
            setShowCommentInputId={() => {}}
            likesState={{}}
            commentsState={{}}
          />
        ))}
      </div>
    );
  };

  const renderUsers = () => {
    // For users tab, check if results.users exists, otherwise use results.data
    const users = results.users || results.data;
    if (!users || users.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Link 
              key={user.id} 
              to={`/app/profile/${user.id}`}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <Avatar 
                  src={user.avatar_url} 
                  alt={user.name || user.username}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {user.name || user.username}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const renderRecipes = () => {
    // For recipes tab, check if results.recipes exists, otherwise use results.data
    const recipes = results.recipes || results.data;
    if (!recipes || recipes.length === 0) return null;
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipes</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium text-blue-700 mb-2 line-clamp-1">{recipe.title}</h4>
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">{recipe.description}</p>
              {recipe.ingredients && (
                <div className="text-xs text-gray-500 line-clamp-2 mb-1">
                  <span className="font-semibold">Ingredients:</span> {recipe.ingredients}
                </div>
              )}
              {recipe.created_at && (
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(recipe.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHashtags = () => {
    // For hashtags tab, check if results.hashtags exists, otherwise use results.data
    const hashtags = results.hashtags || results.data;
    if (!hashtags || hashtags.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hashtags</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {hashtags.map((hashtag, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-600">
                    #{hashtag.tag || hashtag}
                  </h4>
                  {hashtag.count && (
                    <p className="text-sm text-gray-500">
                      {hashtag.count} posts
                    </p>
                  )}
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {activeTab === 'all' ? (
        <>
          {renderPosts()}
          {renderUsers()}
          {renderRecipes()}
          {renderHashtags()}
        </>
      ) : (
        <>
          {activeTab === 'posts' && renderPosts()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'recipes' && renderRecipes()}
          {activeTab === 'hashtags' && renderPosts()}
        </>
      )}
    </div>
  );
};

export default SearchResults; 