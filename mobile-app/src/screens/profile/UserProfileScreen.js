import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'react-query';
import { apiClient } from '../../services/api';

export default function UserProfileScreen({ navigation, route }) {
  const { user } = useAuth();
  const { userId } = route?.params || {};
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery(
    ['userProfile', userId],
    async () => {
      // Check if user is trying to view their own profile
      if (user && userId === user.id) {
        // Redirect to own profile
        navigation.navigate('Profile');
        return null;
      }
      
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    },
    {
      enabled: !!userId,
    }
  );

  // Fetch user posts
  const { data: userPosts, isLoading: postsLoading } = useQuery(
    ['userPosts', userId],
    async () => {
      const response = await apiClient.get(`/users/${userId}/posts`);
      return response.data;
    },
    {
      enabled: !!userId,
      onSuccess: (data) => {
        console.log('API userPosts:', data);
      }
    }
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  const handleFollow = async () => {
    try {
      // This would be implemented based on your API
      setIsFollowing(!isFollowing);
      Alert.alert(
        'Success',
        isFollowing ? 'Unfollowed successfully' : 'Followed successfully'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to follow/unfollow user');
    }
  };

  const handleLike = async (postId, currentCount, currentlyLiked) => {
    try {
      // This would be implemented based on your API
      Alert.alert('Success', 'Post liked/unliked');
    } catch (error) {
      Alert.alert('Error', 'Failed to like/unlike post');
    }
  };

  const handleComment = (postId) => {
    // Navigate to post detail or show comment modal
    navigation.navigate('PostDetail', { postId });
  };

  const renderPost = ({ item }) => {
    const isLiked = false; // This would be determined by your API
    const likesCount = item.likes_count || 0;
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
      return (
        <View style={styles.tabContent}>
          <Text>Liked posts not available for other users</Text>
        </View>
      );
    } else if (activeTab === 'saved') {
      return (
        <View style={styles.tabContent}>
          <Text>Saved posts not available for other users</Text>
        </View>
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
    ...userFromProfile,
    ...(userFromProfile.user_metadata || {}),
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
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
          {user && userId !== user.id && (
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
            style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
            onPress={() => setActiveTab('liked')}
          >
            <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>
              Liked
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

        <View style={styles.tabContentContainer}>
          {renderTabContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  followButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  followingButton: {
    backgroundColor: '#6c757d',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#fff',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
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
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
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
  noImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#999',
    marginTop: 5,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
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
}); 