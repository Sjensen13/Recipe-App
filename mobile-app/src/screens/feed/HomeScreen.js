import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';

export default function HomeScreen({ navigation, route }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [commentInput, setCommentInput] = useState('');
  const [showCommentInputId, setShowCommentInputId] = useState(null);
  const [likesState, setLikesState] = useState({});
  const [commentsState, setCommentsState] = useState({});
  const [hashtagFilter, setHashtagFilter] = useState(null);
  const { user } = useAuth();

  // Get hashtag filter from route params
  useEffect(() => {
    if (route.params?.hashtag) {
      setHashtagFilter(route.params.hashtag);
    }
  }, [route.params?.hashtag]);

  // Fetch posts on component mount and when hashtag filter changes
  useEffect(() => {
    fetchPosts();
  }, [hashtagFilter]);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { page, limit: pagination.limit };
      if (hashtagFilter) {
        params.hashtag = hashtagFilter;
      }
      
      const response = await apiClient.get('/posts', { params });
      
      if (response.data.success) {
        const postsData = response.data.data;
        
        // Initialize likes and comments state for each post
        const initialLikesState = {};
        const initialCommentsState = {};
        
        postsData.forEach(post => {
          initialLikesState[post.id] = post.likes || [];
          initialCommentsState[post.id] = post.comments || [];
        });
        
        setPosts(postsData);
        setPagination(response.data.pagination);
        setLikesState(initialLikesState);
        setCommentsState(initialCommentsState);
      } else {
        throw new Error(response.data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
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

  const fetchAndSetPost = async (postId) => {
    try {
      const response = await apiClient.get(`/posts/${postId}`);
      const updatedPost = response.data.data;
      
      setPosts(prevPosts => prevPosts.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
      setLikesState(prev => ({ ...prev, [postId]: updatedPost.likes || [] }));
      setCommentsState(prev => ({ ...prev, [postId]: updatedPost.comments || [] }));
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  // Handler for hashtag clicks - navigate to explore screen
  const handleHashtagClick = (hashtag) => {
    navigation.navigate('Explore', { 
      hashtag: hashtag,
      searchQuery: hashtag,
      activeTab: 'hashtags'
    });
  };

  // Handler to clear hashtag filter
  const clearHashtagFilter = () => {
    setHashtagFilter(null);
    navigation.setParams({ hashtag: null });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId) => {
    try {
      await apiClient.post(`/posts/${postId}/like`);
      await fetchAndSetPost(postId);
    } catch (err) {
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleComment = (postId) => {
    setShowCommentInputId(postId);
  };

  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;
    try {
      await apiClient.post(`/posts/${postId}/comments`, { content: commentInput });
      await fetchAndSetPost(postId);
      setCommentInput('');
      setShowCommentInputId(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleProfileClick = (userId) => {
    navigation.navigate('Profile', { userId });
  };

  const renderPost = ({ item }) => {
    const postLikes = likesState[item.id] || [];
    const postComments = commentsState[item.id] || [];
    const isLiked = postLikes.some(like => like.user_id === user?.id);
    

    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => handleProfileClick(item.user_id)}
          >
            <Image
              source={{ 
                uri: item.users?.avatar_url || 'https://via.placeholder.com/40',
                headers: { 'Cache-Control': 'no-cache' }
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.username}>
                {item.users?.username || item.users?.name || item.users?.display_name || `User ${item.user_id?.slice(0, 8)}` || 'Unknown User'}
              </Text>
              <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {(item.image_url || item.image) && (
          <Image 
            source={{ 
              uri: item.image_url || item.image,
              headers: { 'Cache-Control': 'no-cache' }
            }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.postContent}>
          <Text style={styles.postText}>{item.content}</Text>
          
          {/* Render hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {item.hashtags.map((hashtag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.hashtag}
                  onPress={() => handleHashtagClick(hashtag)}
                >
                  <Text style={styles.hashtagText}>#{hashtag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? "#FF6B6B" : "#666"} 
            />
            <Text style={styles.actionText}>{postLikes.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleComment(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{postComments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Comment input */}
        {showCommentInputId === item.id && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentInput}
              onChangeText={setCommentInput}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleAddComment(item.id)}
            >
              <Ionicons name="send" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {hashtagFilter ? `#${hashtagFilter}` : 'Home'}
            </Text>
            {user && (
              <Text style={styles.userInfo}>Welcome, {user.username || user.name}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            {hashtagFilter && (
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={clearHashtagFilter}
              >
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Messages')}
            >
              <Ionicons name="chatbubbles-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {hashtagFilter ? `#${hashtagFilter}` : 'Home'}
            </Text>
            {user && (
              <Text style={styles.userInfo}>Welcome, {user.username || user.name}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            {hashtagFilter && (
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={clearHashtagFilter}
              >
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Messages')}
            >
              <Ionicons name="chatbubbles-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            {hashtagFilter ? `#${hashtagFilter}` : 'Home'}
          </Text>
          {user && (
            <Text style={styles.userInfo}>Welcome, {user.username || user.name}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {hashtagFilter && (
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={clearHashtagFilter}
            >
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      {posts && posts.length > 0 ? (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>
            {hashtagFilter ? `No posts with #${hashtagFilter}` : 'No posts yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {hashtagFilter 
              ? `Be the first to share a post with #${hashtagFilter}!`
              : 'Be the first to share a delicious recipe or food story!'
            }
          </Text>
          <TouchableOpacity 
            style={styles.createPostButton}
            onPress={() => navigation.navigate('Create')}
          >
            <Text style={styles.createPostButtonText}>Create Your First Post</Text>
          </TouchableOpacity>
        </View>
      )}
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
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
  },
  clearFilterButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  clearFilterText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
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
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  postContent: {
    padding: 15,
  },
  postText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  hashtag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  hashtagText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 14,
  },
  sendButton: {
    padding: 8,
  },
}); 