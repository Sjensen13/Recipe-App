import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'react-query';
import { apiClient } from '../../services/api';

export default function ExploreScreen({ navigation, route }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  // Handle route parameters for hashtag filtering
  useEffect(() => {
    if (route.params?.hashtag) {
      setSearchQuery(route.params.hashtag);
      setActiveTab(route.params.activeTab || 'hashtags');
    }
  }, [route.params]);

  const { data: searchResults, isLoading, refetch } = useQuery(
    ['search', searchQuery, activeTab],
    async () => {
      if (!searchQuery.trim()) return { posts: [], users: [], recipes: [], hashtags: [] };
      
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

  const { data: popularPosts } = useQuery(
    'popularPosts',
    async () => {
      const response = await apiClient.get('/posts/popular');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      refetch();
    }
  };

  const handleProfileClick = (userId) => {
    if (userId === user?.id) {
      // Navigate to own profile (stays in tab navigator)
      navigation.navigate('Profile');
    } else {
      // Navigate to other user's profile
      navigation.navigate('UserProfile', { userId });
    }
  };

  const handlePostClick = (postId) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleRecipeClick = (recipeId) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const handleHashtagClick = (hashtag) => {
    setSearchQuery(hashtag);
    setActiveTab('hashtags');
    refetch();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const renderPost = ({ item }) => {
    // Helper function to get user display name
    const getUserDisplayName = () => {
      return item.users?.username || 
             item.users?.name || 
             item.users?.display_name || 
             `User ${item.user_id?.slice(0, 8)}` || 
             'Unknown User';
    };

    // Helper function to get avatar URL with fallback
    const getAvatarUrl = () => {
      if (item.users?.avatar_url) {
        return item.users.avatar_url;
      }
      return 'https://via.placeholder.com/40';
    };

    // Handle avatar load error
    const handleAvatarError = (error) => {
      console.log('Avatar load error for user:', item.user_id, 'URL:', item.users?.avatar_url);
    };

    return (
      <TouchableOpacity 
        style={styles.postCard}
        onPress={() => handlePostClick(item.id)}
      >
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => handleProfileClick(item.user_id)}
          >
            <Image
              source={{ 
                uri: getAvatarUrl(),
                headers: { 'Cache-Control': 'no-cache' }
              }}
              style={styles.avatar}
              onError={handleAvatarError}
            />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{getUserDisplayName()}</Text>
              <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
        </View>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}

      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postText}>{item.content}</Text>
      </View>

      {item.hashtags && item.hashtags.length > 0 && (
        <View style={styles.hashtagsContainer}>
          {item.hashtags.map((tag, index) => (
            <Text key={index} style={styles.hashtag}>#{tag}</Text>
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <View style={styles.actionButton}>
          <Ionicons name="heart-outline" size={16} color="#666" />
          <Text style={styles.actionText}>{item.likes?.length || 0}</Text>
        </View>
        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  };

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

  const renderHashtag = ({ item }) => (
    <TouchableOpacity 
      style={styles.hashtagCard}
      onPress={() => handleHashtagClick(item.tag)}
    >
      <Text style={styles.hashtagText}>#{item.tag}</Text>
      <Text style={styles.hashtagCount}>{item.count} posts</Text>
    </TouchableOpacity>
  );

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
        />
      );
    }

    // Show popular hashtags and posts when no search query
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

        {popularPosts && popularPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Posts</Text>
            {popularPosts.map((post, index) => (
              <View key={index}>
                {renderPost({ item: post })}
              </View>
            ))}
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Explore</Text>
          {user && (
            <Text style={styles.userInfo}>Discover new content</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('RecipeSearch')}
        >
          <Ionicons name="restaurant" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, users, recipes, or hashtags..."
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
      </View>

      {searchQuery.trim() && (
        <View style={styles.tabsContainer}>
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
            style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
            onPress={() => setActiveTab('recipes')}
          >
            <Ionicons name="restaurant" size={16} color={activeTab === 'recipes' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
              Recipes
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postContent: {
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    color: '#333',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  hashtag: {
    fontSize: 12,
    color: '#FF6B6B',
    backgroundColor: '#fff0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
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
