import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient } from 'react-query';
import { apiClient } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { getAvatarSource, handleAvatarError } from '../../utils/avatarUtils';

export default function ProfileScreen({ navigation, route }) {
  const { user, logout, clearStoredAuth, resetUserData, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Use user data from AuthContext directly instead of fetching profile
  // This ensures we always have the user data available
  const profile = user ? { data: { user } } : null;
  const profileLoading = false;
  const profileError = null;

  // Fetch user posts
  const { data: userPosts, isLoading: postsLoading } = useQuery(
    ['userPosts', user?.id],
    async () => {
      const response = await apiClient.get(`/users/${user.id}/posts`);
      return response.data;
    },
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        console.log('API userPosts:', data);
      }
    }
  );

  // Fetch liked posts
  const { data: likedPosts, isLoading: likedPostsLoading } = useQuery(
    ['likedPosts', user?.id],
    async () => {
      const response = await apiClient.get(`/users/${user.id}/liked-posts`);
      return response.data?.data || response.data || [];
    },
    {
      enabled: !!user?.id,
    }
  );

  // Fetch user recipes (placeholder, implement API if available)
  const { data: userRecipes, isLoading: recipesLoading } = useQuery(
    ['userRecipes', user?.id],
    async () => {
      const response = await apiClient.get(`/users/${user.id}/recipes`);
      return response.data;
    },
    {
      enabled: !!user?.id,
    }
  );
  // Fetch saved posts/recipes (placeholder, implement API if available)
  const { data: savedItems, isLoading: savedLoading } = useQuery(
    ['savedItems', user?.id],
    async () => {
      const response = await apiClient.get(`/users/${user.id}/saved`);
      return response.data;
    },
    {
      enabled: !!user?.id,
    }
  );

  // Fetch follow data
  useEffect(() => {
    if (user?.id) {
      fetchFollowData();
    }
  }, [user?.id]);

  // Refresh data when user data changes (e.g., after profile update)
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries(['userPosts', user.id]);
      fetchFollowData();
    }
  }, [user?.name, user?.username, user?.bio, user?.avatar_url]);

  // Refresh data when screen comes into focus (e.g., after editing profile)
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        // Refetch posts data
        queryClient.invalidateQueries(['userPosts', user.id]);
        fetchFollowData();
        console.log('ProfileScreen - Screen focused, user data:', user);
      }
    }, [user?.id, queryClient, user?.name, user?.username, user?.bio, user?.avatar_url])
  );

  // Log userPosts for debugging
  console.log('User posts:', userPosts);

  const fetchFollowData = async () => {
    try {
      const targetUserId = user?.id;
      
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
        await apiClient.delete(`/users/${user?.id}/follow`);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await apiClient.post(`/users/${user?.id}/follow`);
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
    console.log('ProfileScreen - Post item data:', {
      id: item.id,
      user: item.user,
      avatar_url: item.user?.avatar_url,
      username: item.user?.username
    });
    const isLiked = likedPostsState[item.id] !== undefined ? likedPostsState[item.id] : item.liked;
    const likesCount = likeCounts[item.id] !== undefined ? likeCounts[item.id] : item.likes_count || 0;
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={getAvatarSource(user?.avatar_url, user?.id)}
            style={styles.postAvatar}
            onError={(error) => handleAvatarError(error, user?.id)}
          />
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

  if (profileLoading || authLoading || !user) {
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

  // Use user data directly from AuthContext with better fallbacks
  const finalDisplayUser = {
    name: user?.name || user?.user_metadata?.name || 'User',
    username: user?.username || user?.user_metadata?.username || 'username',
    bio: user?.bio || user?.user_metadata?.bio || '',
    avatar_url: user?.avatar_url || user?.user_metadata?.avatar_url || '',
    email: user?.email || '',
  };

  // Log for debugging profile updates
  console.log('ProfileScreen - Current user data:', user);
  console.log('ProfileScreen - Final display user:', finalDisplayUser);
  console.log('ProfileScreen - User name changed:', user?.name);
  console.log('ProfileScreen - User username changed:', user?.username);
  console.log('ProfileScreen - User bio changed:', user?.bio);
  console.log('ProfileScreen - User avatar changed:', user?.avatar_url);
  
  // Debug: Check if user has avatar URL in different places
  console.log('ProfileScreen - Avatar URL check:', {
    user_avatar_url: user?.avatar_url,
    user_metadata_avatar_url: user?.user_metadata?.avatar_url,
    final_display_avatar_url: finalDisplayUser?.avatar_url,
    has_avatar: !!finalDisplayUser?.avatar_url
  });

  // If we still don't have proper user data, show a message with reset option
  if (!user?.id || user?.success || user?.message) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>No user data available. Please log in again.</Text>
          <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
            User ID: {user?.id || 'null'}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            User object: {JSON.stringify(user, null, 2)}
          </Text>
          <TouchableOpacity 
            style={{ marginTop: 20, padding: 10, backgroundColor: '#007bff', borderRadius: 5 }}
            onPress={resetUserData}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Reset User Data</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Log for debugging
  console.log('Auth user:', user);
  console.log('User metadata:', user?.user_metadata);
  console.log('Final display user:', finalDisplayUser);
  console.log('User ID:', user?.id);
  console.log('User email:', user?.email);
  console.log('User name:', user?.name);
  console.log('User username:', user?.username);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {user?.id && (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="create-outline" size={24} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.profileSection} key={`${user?.name}-${user?.username}-${user?.bio}-${user?.avatar_url}`}>
          <View style={styles.avatarPlaceholder}>
            <Image 
              source={getAvatarSource(finalDisplayUser?.avatar_url, finalDisplayUser?.id || user?.id)} 
              style={styles.avatar}
              onError={(error) => handleAvatarError(error, finalDisplayUser?.id || user?.id)}
            />
          </View>
          <Text style={styles.name}>{finalDisplayUser?.name}</Text>
          {finalDisplayUser?.username && (
            <Text style={styles.handle}>@{finalDisplayUser.username}</Text>
          )}
          {finalDisplayUser?.bio && (
            <Text style={styles.bio}>{finalDisplayUser.bio}</Text>
          )}
          {/* Follow button removed - users shouldn't follow themselves */}
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
