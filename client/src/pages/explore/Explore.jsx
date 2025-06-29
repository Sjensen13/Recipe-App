import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/search/SearchBar';
import FilterTabs from '../../components/search/FilterTabs';
import SearchResults from '../../components/search/SearchResults';
import PopularHashtags from '../../components/search/PopularHashtags';
import { search, searchPosts, searchUsers, searchHashtags, searchRecipes } from '../../services/api/search';
import { useAuth } from '../../context/auth/AuthContext';
import { useNotification } from '../../context/notification/NotificationContext';

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addNotification } = useNotification();
  const { user } = useAuth();
  
  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'posts');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (query, type) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          performSearch(query, type);
        }, 300);
      };
    })(),
    []
  );

  // Perform search based on type
  const performSearch = async (query, type = activeTab) => {
    if (!query.trim()) {
      setResults(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setPage(1);

    try {
      let response;
      
      switch (type) {
        case 'posts':
          response = await searchPosts(query, { page: 1, limit: 10 });
          break;
        case 'users':
          response = await searchUsers(query, { page: 1, limit: 10 });
          break;
        case 'hashtags':
          response = await searchPosts(query.startsWith('#') ? query : `#${query}`, { page: 1, limit: 10 });
          break;
        case 'recipes':
          response = await searchRecipes(query, { page: 1, limit: 10 });
          break;
        default:
          response = await searchPosts(query, { page: 1, limit: 10 });
      }

      console.log('Search response:', response); // Debug log

      if (response.success) {
        // The API returns { success: true, data: [...], pagination: {...} }
        // We need to pass the entire response to SearchResults
        setResults(response);
        setHasMore(response.data.length === 10);
      } else {
        setError('Search failed');
        addNotification('Search failed', 'error');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search');
      addNotification('Failed to perform search', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load more results
  const loadMore = async () => {
    if (!searchQuery.trim() || loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    try {
      let response;
      
      switch (activeTab) {
        case 'posts':
          response = await searchPosts(searchQuery, { page: nextPage, limit: 10 });
          break;
        case 'users':
          response = await searchUsers(searchQuery, { page: nextPage, limit: 10 });
          break;
        case 'hashtags':
          response = await searchHashtags(searchQuery, { page: nextPage, limit: 10 });
          break;
        case 'recipes':
          response = await searchRecipes(searchQuery, { page: nextPage, limit: 10 });
          break;
        default:
          response = await searchPosts(searchQuery, { page: nextPage, limit: 10 });
      }

      if (response.success) {
        // Merge the new data with existing data
        setResults(prev => ({
          ...prev,
          data: [...(prev?.data || []), ...(response.data || [])],
          pagination: response.pagination
        }));
        setPage(nextPage);
        setHasMore(response.data.length === 10);
      }
    } catch (err) {
      console.error('Load more error:', err);
      addNotification('Failed to load more results', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    // Update URL params
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    newParams.set('type', activeTab);
    setSearchParams(newParams);
    debouncedSearch(query, activeTab);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    // Update URL params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    newParams.set('type', tab);
    setSearchParams(newParams);
    if (searchQuery.trim()) {
      performSearch(searchQuery, tab);
    } else {
      setResults(null);
      setError(null);
    }
  };

  // Handle hashtag click from popular hashtags
  const handleHashtagClick = (hashtag) => {
    const query = `#${hashtag}`;
    setSearchQuery(query);
    setActiveTab('hashtags');
    setPage(1);
    // Update URL params
    const newParams = new URLSearchParams();
    newParams.set('q', query);
    newParams.set('type', 'hashtags');
    setSearchParams(newParams);
    performSearch(query, 'hashtags');
  };

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'posts';
    setActiveTab(type);
    if (query) {
      setSearchQuery(query);
      performSearch(query, type);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Explore
        </h1>
        <p className="text-gray-600">
          Discover new recipes, users, and trending hashtags
        </p>
      </div>

      {/* Filter Tabs - always visible */}
      <FilterTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar 
          onSearch={handleSearch}
          placeholder={`Search ${activeTab}`}
        />
      </div>

      {/* Search Results or Popular Hashtags */}
      {searchQuery ? (
        <SearchResults
          results={results}
          activeTab={activeTab}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          onLoadMore={loadMore}
        />
      ) : (
        <div className="space-y-8">
          <PopularHashtags onHashtagClick={handleHashtagClick} />
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              🔍 Start searching to discover content
            </div>
            <p className="text-gray-500">
              Search for posts, users, recipes, or hashtags to get started
            </p>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && searchQuery && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Explore; 