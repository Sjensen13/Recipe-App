import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

export default function PostDetailScreen({ route }) {
  const navigation = useNavigation();
  const { postId } = route.params || {};
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostAndComments();
  }, [postId]);

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const postRes = await apiClient.get(`/posts/${postId}`);
      setPost(postRes.data);
      const commentsRes = await apiClient.get(`/posts/${postId}/comments`);
      setComments(commentsRes.data || []);
    } catch (err) {
      console.log('Post/comments error:', err?.response?.data || err.message || err);
      Alert.alert('Error', 'Failed to load post or comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/posts/${postId}/comments`, { content: commentText });
      setCommentText('');
      fetchPostAndComments();
    } catch (err) {
      console.log('Add comment error:', err?.response?.data || err.message || err);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}><Text>Loading...</Text></View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}><Text>Post not found</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
      </View>
      <FlatList
        ListHeaderComponent={
          <View style={styles.postCard}>
            {post.image && (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            )}
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.postMeta}>
              <Ionicons name="heart" size={18} color="#FF6B6B" />
              <Text style={styles.metaText}>{post.likes_count || 0}</Text>
              <Ionicons name="chatbubble-outline" size={18} color="#666" style={{ marginLeft: 16 }} />
              <Text style={styles.metaText}>{post.comments_count || comments.length}</Text>
            </View>
          </View>
        }
        data={comments}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Ionicons name="person-circle" size={28} color="#aaa" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.commentUser}>{item.user?.username || 'User'}</Text>
              <Text style={styles.commentText}>{item.content}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noComments}>No comments yet.</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            editable={!submitting}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleAddComment} disabled={submitting || !commentText.trim()}>
            <Ionicons name="send" size={24} color={submitting || !commentText.trim() ? '#ccc' : '#007bff'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16 },
  postImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  postContent: { fontSize: 16, color: '#333', marginBottom: 8 },
  postMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 14, color: '#666', marginLeft: 4 },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, backgroundColor: '#fff', borderRadius: 8, padding: 10 },
  commentUser: { fontWeight: 'bold', color: '#333', marginBottom: 2 },
  commentText: { color: '#444' },
  noComments: { color: '#888', textAlign: 'center', marginTop: 20 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  commentInput: { flex: 1, fontSize: 16, padding: 8, backgroundColor: '#f4f4f4', borderRadius: 20, marginRight: 8 },
  sendButton: { padding: 8 },
});
