import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { useNotification } from '../../context/notification/NotificationContext';
import { useCloudinary } from '../../hooks/useCloudinary';
import { 
  getRecipes, 
  detectIngredients, 
  searchByIngredients, 
  getCategories, 
  getDifficulties 
} from '../../services/api/recipes';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import RecipeCard from '../../components/recipe/RecipeCard';
// Commented out: import IngredientDetection from '../../components/recipe/IngredientDetection';
import SearchFilters from '../../components/recipe/SearchFilters';
import SearchTabs from '../../components/recipe/SearchTabs';

const RecipeSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { uploadImage } = useCloudinary();

  // State
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [manualIngredients, setManualIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    cookingTime: '',
    servings: ''
  });
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [metadataError, setMetadataError] = useState(false);

  // Load categories and difficulties on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesRes, difficultiesRes] = await Promise.all([
          getCategories(),
          getDifficulties()
        ]);
        let error = false;
        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
        } else {
          error = true;
        }
        if (difficultiesRes.success) {
          setDifficulties(difficultiesRes.data);
        } else {
          error = true;
        }
        setMetadataError(error);
      } catch (error) {
        setMetadataError(true);
        console.error('Error loading metadata:', error);
      }
    };

    loadMetadata();
  }, []);

  // Combined search function
  const combinedSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Combine detected and manual ingredients
    const allIngredients = [...detectedIngredients, ...manualIngredients];

    try {
      const response = await getRecipes({
        search: searchQuery,
        ingredients: allIngredients.length > 0 ? allIngredients.join(',') : undefined,
        ...filters
      });

      if (response.success) {
        setRecipes(response.data);
      } else {
        setError('Failed to search recipes');
        addNotification('Failed to search recipes', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search recipes');
      addNotification('Failed to search recipes', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, detectedIngredients, manualIngredients, filters, addNotification]);

  // Commented out: const handleIngredientDetection = async (imageFile) => {
  //   try {
  //     // Upload image to Cloudinary
  //     const uploadResult = await uploadImage(imageFile, 'recipe-ingredients');
      
  //     if (!uploadResult.success) {
  //       throw new Error('Failed to upload image');
  //     }

  //     // Detect ingredients from uploaded image
  //     const detectionResult = await detectIngredients(uploadResult.url);
      
  //     if (detectionResult.success) {
  //       setDetectedIngredients(detectionResult.data.ingredients);
  //       addNotification(`Detected ${detectionResult.data.count} ingredients!`, 'success');
  //     } else {
  //       throw new Error('Failed to detect ingredients');
  //     }
  //   } catch (error) {
  //     console.error('Ingredient detection error:', error);
  //     addNotification('Failed to detect ingredients from image', 'error');
  //   }
  // };

  // Handle manual ingredient addition
  const handleAddIngredient = (ingredient) => {
    if (ingredient.trim() && !manualIngredients.includes(ingredient.trim())) {
      setManualIngredients([...manualIngredients, ingredient.trim()]);
    }
  };

  // Handle ingredient removal
  const handleRemoveIngredient = (ingredient, type = 'manual') => {
    if (type === 'detected') {
      setDetectedIngredients(detectedIngredients.filter(i => i !== ingredient));
    } else {
      setManualIngredients(manualIngredients.filter(i => i !== ingredient));
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle recipe click
  const handleRecipeClick = (recipe) => {
    navigate(`/app/recipe/${recipe.id}`);
  };

  // Handle create recipe
  const handleCreateRecipe = () => {
    navigate('/app/recipe/create');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recipe Search</h1>
              <p className="mt-2 text-gray-600">
                Find delicious recipes by name, ingredients, or upload a photo of your ingredients
              </p>
            </div>
            <button
              onClick={handleCreateRecipe}
              className="btn-primary"
            >
              Create Recipe
            </button>
          </div>
        </div>
        {metadataError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            Could not load recipe categories or difficulties. Please try again later.
          </div>
        )}

        {/* Search Tabs */}
        <SearchTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Search Content */}
        <div className="mt-6">
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Text Search */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Search by Name or Description
                </h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for recipes..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && combinedSearch()}
                  />
                  <button
                    onClick={combinedSearch}
                    disabled={!searchQuery.trim() || loading}
                    className="btn-primary"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Filters */}
              <SearchFilters
                filters={filters}
                categories={categories}
                difficulties={difficulties}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              {/* Ingredient Detection temporarily disabled */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detect Ingredients from Image
                </h3>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔧</div>
                  <p className="text-gray-600 mb-2">
                    Computer vision functionality is temporarily disabled
                  </p>
                  <p className="text-sm text-gray-500">
                    This feature will be implemented later. For now, please add ingredients manually.
                  </p>
                </div>
              </div>
              {/* Manual Ingredients */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Ingredients Manually
                </h3>
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Add an ingredient..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleAddIngredient(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                
                {/* Manual Ingredients List */}
                {manualIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {manualIngredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {ingredient}
                        <button
                          onClick={() => handleRemoveIngredient(ingredient)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="flex justify-center">
                <button
                  onClick={combinedSearch}
                  disabled={detectedIngredients.length === 0 && manualIngredients.length === 0 || loading}
                  className="btn-primary px-8 py-3"
                >
                  Search Recipes by Ingredients
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="mt-8 flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="mt-8">
            <ErrorState 
              message={error}
              onRetry={combinedSearch}
            />
          </div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Found {recipes.length} Recipes
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && searchQuery && (
          <div className="mt-8 text-center py-12">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeSearch; 