import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'react-query';
import { apiClient } from '../../services/api';

export default function ProfileScreen({ navigation, route }) {
  const { user, logout, clearStoredAuth } = useAuth();
  const { userId } = route?.params || {};
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Determine if viewing own profile
  const isOwnProfile = !userId || userId === user?.id;

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery(
    ['profile', userId || user?.id],
    async () => {
      const targetUserId = userId || user?.id;
      const response = await apiClient.get(`/users/${targetUserId}`);
      return response.data;
    },
    {
      enabled: !!(userId || user?.id),
    }
  );

  // Fetch user posts
  const { data: userPosts, isLoading: postsLoading } = useQuery(
    ['userPosts', userId || user?.id],
    async () => {
      const targetUserId = userId || user?.id;
      const response = await apiClient.get(`/users/${targetUserId}/posts`);
      return response.data;
    },
    {
      enabled: !!(userId || user?.id),
      onSuccess: (data) => {
        console.log('API userPosts:', data);
      }
    }
  );

  // Fetch liked posts
  const { data: likedPosts, isLoading: likedPostsLoading } = useQuery(
    ['likedPosts', userId || user?.id],
    async () => {
      const targetUserId = userId || user?.id;
      const response = await apiClient.get(`/users/${targetUserId}/liked-posts`);
      return response.data?.data || response.data || [];
    },
    {
      enabled: !!(userId || user?.id),
    }
  );

  // Fetch user recipes (placeholder, implement API if available)
  const { data: userRecipes, isLoading: recipesLoading } = useQuery(
    ['userRecipes', userId || user?.id],
    async () => {
      const targetUserId = userId || user?.id;
      const response = await apiClient.get(`/users/${targetUserId}/recipes`);
      return response.data;
    },
    {
      enabled: !!(userId || user?.id),
    }
  );
  // Fetch saved posts/recipes (placeholder, implement API if available)
  const { data: savedItems, isLoading: savedLoading } = useQuery(
    ['savedItems', userId || user?.id],
    async () => {
      const targetUserId = userId || user?.id;
      const response = await apiClient.get(`/users/${targetUserId}/saved`);
      return response.data;
    },
    {
      enabled: !!(userId || user?.id),
    }
  );

  // Fetch follow data
  useEffect(() => {
    if ((userId || user?.id) && user?.id) {
      fetchFollowData();
    }
  }, [userId, user?.id]);

  // Log userPosts for debugging
  console.log('User posts:', userPosts);

  const fetchFollowData = async () => {
    try {
      const targetUserId = userId || user?.id;
      
      // Check if following
      const followResponse = await apiClient.get(`/users/${targetUserId}/follow-status`);
      setIsFollowing(followResponse.data?.isFollowing || false);

      // Get followers count
      const followersResponse = await apiClient.get(`/users/${targetUserId}/followers-count`);
      setFollowersCount(followersResponse.data?.count || 0);

      // Get following count
      const followingResponse = await apiClient.get(`/users/${targetUserId}/following-count`);
      setFollowingCount(followingResponse.data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch follow data:', error);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await apiClient.delete(`/users/${userId}/follow`);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await apiClient.post(`/users/${userId}/follow`);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  // Add state for local like toggling and like counts
  const [likeLoading, setLikeLoading] = useState(false);
  const [likedPostsState, setLikedPosts] = useState({}); // { [postId]: true/false }
  const [likeCounts, setLikeCounts] = useState({}); // { [postId]: number }

  // Like handler
  const handleLike = async (postId, currentCount, currentlyLiked) => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await apiClient.post(`/posts/${postId}/like`); // Always use POST for toggling like
      setLikedPosts((prev) => ({ ...prev, [postId]: !currentlyLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: currentlyLiked ? Math.max((prev[postId] ?? currentCount) - 1, 0) : (prev[postId] ?? currentCount) + 1
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  // Comment handler
  const handleComment = (postId) => {
    navigation.navigate('PostDetail', { postId });
  };

  const renderPost = ({ item }) => {
    const isLiked = likedPostsState[item.id] !== undefined ? likedPostsState[item.id] : item.liked;
    const likesCount = likeCounts[item.id] !== undefined ? likeCounts[item.id] : item.likes_count || 0;
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          {item.user?.avatar_url ? (
            <Image
              source={{ uri: item.user.avatar_url }}
              style={styles.postAvatar}
              onError={(error) => console.log('Avatar load error:', error)}
            />
          ) : (
            <View style={[styles.postAvatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#ccc" />
            </View>
          )}
          <View style={styles.postInfo}>
            <Text style={styles.postUsername}>{item.user?.username || 'Unknown User'}</Text>
            <Text style={styles.postTimestamp}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.postImage}
            onError={(error) => console.log('Image load error:', error)}
          />
        ) : (
          <View style={[styles.postImage, styles.noImagePlaceholder]}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
            <Text style={styles.noImageText}>No image</Text>
          </View>
        )}

        <View style={styles.postContent}>
          <Text style={styles.postText}>{item.content}</Text>
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id, likesCount, isLiked)}
            disabled={likeLoading}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#FF6B6B' : '#666'}
            />
            <Text style={styles.actionText}>{likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#666" />
            <Text style={styles.actionText}>{item.comments_count || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'posts') {
      if (postsLoading) {
        return (
          <View style={styles.tabContent}>
            <Text>Loading posts...</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={userPosts || []}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.postsList}
          showsVerticalScrollIndicator={false}
        />
      );
    } else if (activeTab === 'liked') {
      if (likedPostsLoading) {
        return (
          <View style={styles.tabContent}>
            <Text>Loading liked posts...</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={likedPosts || []}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.postsList}
          showsVerticalScrollIndicator={false}
        />
      );
    }
    return null;
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Log profile and user for debugging
  console.log('Profile data:', profile);
  console.log('Auth context user:', user);

  // Merge user_metadata fields for display, handling nested profile.data.user
  const userFromProfile = profile?.data?.user || {};
  const displayUser = {
    ...(user || {}),
    ...(user?.user_metadata || {}),
    ...userFromProfile,
    ...(userFromProfile.user_metadata || {}),
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {isOwnProfile && (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.editButton} onPress={() => {/* TODO: Implement edit profile navigation */}}>
              <Ionicons name="create-outline" size={24} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={clearStoredAuth}>
              <Ionicons name="refresh-outline" size={24} color="#FF9500" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            {displayUser?.avatar_url ? (
              <Image source={{ uri: displayUser.avatar_url }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={60} color="#ccc" />
            )}
          </View>
          <Text style={styles.name}>{displayUser?.name}</Text>
          {displayUser?.username && (
            <Text style={styles.handle}>@{displayUser.username}</Text>
          )}
          {displayUser?.bio && (
            <Text style={styles.bio}>{displayUser.bio}</Text>
          )}
          {!isOwnProfile && (
            <TouchableOpacity 
              style={[styles.followButton, isFollowing && styles.followingButton]} 
              onPress={handleFollow}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userPosts?.length || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
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
            style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
            onPress={() => setActiveTab('recipes')}
          >
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
              Recipes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
            onPress={() => setActiveTab('liked')}
          >
            <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>
              Likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
              Saved
            </Text>
          </TouchableOpacity>
        </View>
        {/* Tab Content */}
        {activeTab === 'posts' && renderTabContent()}
        {activeTab === 'recipes' && (
          <View style={styles.tabContent}>
            {recipesLoading ? <Text>Loading recipes...</Text> : <Text>{userRecipes?.length ? 'Recipes list here' : 'No recipes yet.'}</Text>}
          </View>
        )}
        {activeTab === 'liked' && renderTabContent()}
        {activeTab === 'saved' && (
          <View style={styles.tabContent}>
            {savedLoading ? <Text>Loading saved items...</Text> : <Text>{savedItems?.length ? 'Saved items list here' : 'No saved items yet.'}</Text>}
          </View>
        )}
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  followingButton: {
    backgroundColor: '#6c757d',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#fff',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
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
  postInfo: {
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postTimestamp: {
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
    paddingVertical: 8, // Increased touch area
    paddingHorizontal: 12, // Increased touch area
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsList: {
    paddingBottom: 20,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  handle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 2,
  },
  bio: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  editButton: {
    marginRight: 10,
    padding: 5,
  },
  noImagePlaceholder: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 5,
  },
  avatarPlaceholder: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
