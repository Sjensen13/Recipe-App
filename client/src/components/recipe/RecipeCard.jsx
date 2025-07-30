import React from 'react';
import CloudinaryImage from '../ui/CloudinaryImage';
import Avatar from '../ui/Avatar';

const RecipeCard = ({ recipe, onClick }) => {
  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '😐';
      case 'hard': return '😰';
      case 'expert': return '👨‍🍳';
      default: return '🍳';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Recipe Image */}
      <div className="relative h-48 bg-gray-200">
        {recipe.image_url ? (
          <CloudinaryImage
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Source Badge */}
        {recipe.source === 'spoonacular' && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            External
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        {/* Title and Author */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-2">
            <Avatar 
              src={recipe.user?.avatar_url} 
              alt={recipe.user?.username}
              size="sm"
              userId={recipe.user?.id}
            />
            <span className="text-sm text-gray-600">
              {recipe.user?.full_name || recipe.user?.username || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {recipe.description}
          </p>
        )}

        {/* Recipe Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          {recipe.cooking_time && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatTime(recipe.cooking_time)}
            </div>
          )}
          
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.servings} servings
            </div>
          )}
        </div>

        {/* Difficulty and Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
              <span className="mr-1">{getDifficultyIcon(recipe.difficulty)}</span>
              {recipe.difficulty}
            </span>
          </div>
          
          {recipe.category && (
            <span className="text-xs text-gray-500 capitalize">
              {recipe.category}
            </span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs text-gray-400">
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Relevance Score (for ingredient search) */}
        {recipe.relevanceScore !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Ingredient Match</span>
              <span className="font-medium">
                {Math.round(recipe.relevanceScore * 100)}%
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${recipe.relevanceScore * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard; 