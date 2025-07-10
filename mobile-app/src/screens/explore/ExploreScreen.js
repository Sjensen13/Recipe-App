import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'react-query';
import { apiClient } from '../../services/api';

export default function ExploreScreen({ navigation }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  const { data: searchResults, isLoading, refetch } = useQuery(
    ['search', searchQuery, activeTab],
    async () => {
      if (!searchQuery.trim()) return { posts: [], users: [] };
      
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
    navigation.navigate('Profile', { userId });
  };

  const handlePostClick = (postId) => {
    navigation.navigate('PostDetail', { postId });
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

  const renderPost = ({ item }) => (
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
            source={{ uri: item.user?.avatar_url || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.username}>{item.user?.username || 'Unknown User'}</Text>
            <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}

      <View style={styles.postContent}>
        <Text style={styles.postText}>{item.content}</Text>
      </View>

      <View style={styles.postActions}>
        <View style={styles.actionButton}>
          <Ionicons name="heart-outline" size={16} color="#666" />
          <Text style={styles.actionText}>{item.likes_count || 0}</Text>
        </View>
        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.actionText}>{item.comments_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (searchQuery.trim()) {
      if (isLoading) {
        return (
          <View style={styles.centerContainer}>
            <Text>Searching...</Text>
          </View>
        );
      }

      const results = searchResults?.[activeTab] || [];
      
      if (results.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.noResultsText}>No {activeTab} found for "{searchQuery}"</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={results}
          renderItem={activeTab === 'posts' ? renderPost : renderUser}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      );
    } else {
      // Show popular posts when no search query
      return (
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Posts</Text>
          {popularPosts && popularPosts.length > 0 ? (
            <FlatList
              data={popularPosts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.centerContainer}>
              <Text>No popular posts yet</Text>
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        {user && (
          <Text style={styles.userInfo}>Discover new content</Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, users, or hashtags..."
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
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
              Users
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
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
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
  noResultsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  popularSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    backgroundColor: '#fff',
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
  postText: {
    fontSize: 16,
    color: '#333',
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
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
});
