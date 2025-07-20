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
  const [activeTab, setActiveTab] = useState('recipes');
  const [searchMode, setSearchMode] = useState('name'); // 'name' or 'ingredients'

  // Search results query
  const { data: searchResults, isLoading, refetch } = useQuery(
    ['search', searchQuery, activeTab],
    async () => {
      if (!searchQuery.trim()) return { recipes: [], posts: [], users: [], hashtags: [] };
      
      const response = await apiClient.get('/search', {
        params: {
          q: searchQuery,
          type: activeTab,
        },
      });
      return response.data;
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
    setActiveTab('hashtags');
    refetch();
  };

  // Handle profile click
  const handleProfileClick = (userId) => {
    navigation.navigate('Profile', { userId });
  };

  // Handle post click
  const handlePostClick = (postId) => {
    navigation.navigate('PostDetail', { postId });
  };

  // Handle recipe click
  const handleRecipeClick = (recipeId) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  // Render recipe item
  const renderRecipe = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => handleRecipeClick(item.id)}
    >
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.recipeMeta}>
        <Text style={styles.recipeTime}>{item.cooking_time} min</Text>
        <Text style={styles.recipeDifficulty}>{item.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render post item
  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => handlePostClick(item.id)}
    >
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.users?.avatar_url || 'https://via.placeholder.com/40' }}
          style={styles.postAvatar}
        />
        <View style={styles.postUserInfo}>
          <Text style={styles.postUsername}>{item.users?.username || 'Unknown'}</Text>
          <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>
      {item.hashtags && item.hashtags.length > 0 && (
        <View style={styles.hashtagsContainer}>
          {item.hashtags.map((tag, index) => (
            <Text key={index} style={styles.hashtag}>#{tag}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  // Render user item
  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => handleProfileClick(item.id)}
    >
      <Image
        source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username || item.name}</Text>
        <Text style={styles.userBio}>{item.bio || 'No bio available'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  // Render hashtag item
  const renderHashtag = ({ item }) => (
    <TouchableOpacity 
      style={styles.hashtagCard}
      onPress={() => handleHashtagClick(item.tag)}
    >
      <Text style={styles.hashtagText}>#{item.tag}</Text>
      <Text style={styles.hashtagCount}>{item.count} posts</Text>
    </TouchableOpacity>
  );

  // Render content based on active tab and search state
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

      const results = searchResults?.[activeTab] || [];
      
      if (results.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No {activeTab} found for "{searchQuery}"</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={results}
          renderItem={
            activeTab === 'recipes' ? renderRecipe :
            activeTab === 'posts' ? renderPost :
            activeTab === 'users' ? renderUser :
            renderHashtag
          }
          keyExtractor={(item) => item.id?.toString() || item.tag}
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
            <Text style={styles.sectionTitle}>Popular Hashtags</Text>
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
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.suggestionText}>Start searching to discover content</Text>
          <Text style={styles.suggestionSubtext}>
            Search for recipes, posts, users, or hashtags to get started
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
            placeholder={searchMode === 'name' ? "Search recipes, posts, users..." : "Enter ingredients..."}
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

      {/* Filter Tabs */}
      {searchQuery.trim() && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
            onPress={() => setActiveTab('recipes')}
          >
            <Ionicons name="restaurant" size={16} color={activeTab === 'recipes' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
              Recipes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons name="document-text" size={16} color={activeTab === 'posts' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons name="people" size={16} color={activeTab === 'users' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
              Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'hashtags' && styles.activeTab]}
            onPress={() => setActiveTab('hashtags')}
          >
            <Ionicons name="pricetag" size={16} color={activeTab === 'hashtags' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'hashtags' && styles.activeTabText]}>
              Hashtags
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    marginBottom: 10,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recipeTime: {
    fontSize: 12,
    color: '#999',
  },
  recipeDifficulty: {
    fontSize: 12,
    color: '#999',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUserInfo: {
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  hashtag: {
    fontSize: 12,
    color: '#FF6B6B',
    backgroundColor: '#fff0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userBio: {
    fontSize: 14,
    color: '#666',
  },
  hashtagCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hashtagText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  hashtagCount: {
    fontSize: 14,
    color: '#666',
  },
});
