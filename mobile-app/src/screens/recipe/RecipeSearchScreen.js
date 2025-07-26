import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'react-query';
import { apiClient } from '../../services/api';

export default function RecipeSearchScreen({ navigation }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('name'); // 'name' or 'ingredients'

  // Search results query - only search recipes
  const { data: searchResults, isLoading, refetch } = useQuery(
    ['recipeSearch', searchQuery, searchMode],
    async () => {
      if (!searchQuery.trim()) return { recipes: [] };
      
      // Use the recipes endpoint with search parameter (same as web client)
      const response = await apiClient.get('/recipes', {
        params: {
          search: searchQuery,
        },
      });
      return { recipes: response.data.data || [] };
    },
    {
      enabled: !!searchQuery.trim(),
      refetchOnWindowFocus: false,
    }
  );

  // Popular hashtags query
  const { data: popularHashtags } = useQuery(
    'popularHashtags',
    async () => {
      const response = await apiClient.get('/search/popular-hashtags');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      refetch();
    }
  };

  // Handle hashtag click
  const handleHashtagClick = (hashtag) => {
    setSearchQuery(hashtag);
    refetch();
  };

  // Handle recipe click
  const handleRecipeClick = (recipeId) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const renderRecipe = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => handleRecipeClick(item.id)}
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
        style={styles.recipeImage}
        resizeMode="cover"
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.recipeMeta}>
          <View style={styles.recipeMetaItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.recipeMetaText}>{item.cooking_time || 0} min</Text>
          </View>
          <View style={styles.recipeMetaItem}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.recipeMetaText}>{item.servings || 1} servings</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render content based on search state
  const renderContent = () => {
    if (searchQuery.trim()) {
      if (isLoading) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        );
      }

      const recipes = searchResults?.recipes || [];
      
      if (recipes.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="restaurant-outline" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No recipes found for "{searchQuery}"</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      );
    }

    // Show popular hashtags and search suggestions when no search query
    return (
      <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
        {popularHashtags && popularHashtags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Recipe Tags</Text>
            <View style={styles.hashtagsGrid}>
              {popularHashtags.slice(0, 10).map((hashtag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularHashtag}
                  onPress={() => handleHashtagClick(hashtag.tag)}
                >
                  <Text style={styles.popularHashtagText}>#{hashtag.tag}</Text>
                  <Text style={styles.popularHashtagCount}>{hashtag.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.centerContainer}>
          <Ionicons name="restaurant-outline" size={48} color="#ccc" />
          <Text style={styles.suggestionText}>Start searching to discover recipes</Text>
          <Text style={styles.suggestionSubtext}>
            Search for recipes by name, description, or ingredients
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Recipe Search</Text>
          <Text style={styles.headerSubtitle}>Find delicious recipes</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('CreateRecipe')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Search Mode Tabs */}
      <View style={styles.searchModeContainer}>
        <TouchableOpacity 
          style={[styles.searchModeTab, searchMode === 'name' && styles.activeSearchModeTab]}
          onPress={() => setSearchMode('name')}
        >
          <Ionicons name="search" size={16} color={searchMode === 'name' ? '#fff' : '#666'} />
          <Text style={[styles.searchModeText, searchMode === 'name' && styles.activeSearchModeText]}>
            Search by Name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.searchModeTab, searchMode === 'ingredients' && styles.activeSearchModeTab]}
          onPress={() => setSearchMode('ingredients')}
        >
          <Ionicons name="restaurant" size={16} color={searchMode === 'ingredients' ? '#fff' : '#666'} />
          <Text style={[styles.searchModeText, searchMode === 'ingredients' && styles.activeSearchModeText]}>
            Search by Ingredients
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchMode === 'name' ? "Search recipes..." : "Enter ingredients..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!searchQuery.trim()}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerButton: {
    padding: 5,
  },
  searchModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeSearchModeTab: {
    backgroundColor: '#FF6B6B',
  },
  searchModeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 5,
  },
  activeSearchModeText: {
    color: '#fff',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 5,
  },
  activeTabText: {
    color: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  suggestionsContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  hashtagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  popularHashtag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularHashtagText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  popularHashtagCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  suggestionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  suggestionSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  resultsList: {
    padding: 10,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden', // Ensure image doesn't overflow
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recipeDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  recipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeMetaText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});
