import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from 'react-query';
import { apiClient } from '../../services/api';

export default function MessagesScreen({ navigation }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: conversations, isLoading, error } = useQuery(
    'conversations',
    async () => {
      const response = await apiClient.get('/messages/conversations');
      console.log('Conversations API response:', JSON.stringify(response.data, null, 2));
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      retry: 3,
    }
  );

  // Search users query
  const { data: searchResults, isLoading: searchLoading } = useQuery(
    ['searchUsers', searchQuery],
    async () => {
      if (!searchQuery.trim()) return [];
      const response = await apiClient.get(`/search/users?q=${encodeURIComponent(searchQuery.trim())}`);
      return response.data.data.filter(u => u.id !== user?.id); // Exclude current user
    },
    {
      enabled: !!searchQuery.trim(),
      refetchOnWindowFocus: false,
    }
  );

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

  const renderConversation = ({ item }) => {
    const otherUser = item.other_user;
    const lastMessage = item.last_message;

    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Conversation', { conversationId: item.id, otherUser })}
      >
        <Image
          source={{ uri: otherUser?.avatar_url || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.conversationInfo}>
          <Text style={styles.username}>{otherUser?.username || 'Unknown User'}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage?.content || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.conversationMeta}>
          <Text style={styles.timestamp}>
            {lastMessage ? formatDate(lastMessage.created_at) : ''}
          </Text>
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unread_count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchResult = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.searchResultItem}
        onPress={() => {
          setShowSearch(false);
          setSearchQuery('');
          navigation.navigate('Conversation', { 
            conversationId: item.id, 
            otherUser: item 
          });
        }}
      >
        <Image
          source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.searchResultInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userName}>{item.name}</Text>
        </View>
        <Ionicons name="chatbubble-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Messages</Text>
        {user && (
          <Text style={styles.userInfo}>Your conversations</Text>
        )}
      </View>
      
      {/* Search Toggle Button */}
      <TouchableOpacity 
        style={styles.searchToggle}
        onPress={() => setShowSearch(!showSearch)}
      >
        <Ionicons 
          name={showSearch ? "close" : "search"} 
          size={24} 
          color="#FF6B6B" 
        />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => {
    if (!showSearch) return null;
    
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search users..."
            placeholderTextColor="#999"
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load conversations</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      
      {showSearch ? (
        // Search Results
        <FlatList
          data={searchResults || []}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.searchResultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptySearchContainer}>
              {searchLoading ? (
                <Text style={styles.emptyText}>Searching...</Text>
              ) : searchQuery.trim() ? (
                <Text style={styles.emptyText}>No users found</Text>
              ) : (
                <Text style={styles.emptyText}>Search for users to start a conversation</Text>
              )}
            </View>
          }
        />
      ) : (
        // Conversations List
        conversations && conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.conversationsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>Start a conversation with other users</Text>
            <TouchableOpacity 
              style={styles.startConversationButton}
              onPress={() => setShowSearch(true)}
            >
              <Text style={styles.startConversationText}>Search Users</Text>
            </TouchableOpacity>
          </View>
        )
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  searchToggle: {
    padding: 5,
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
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  conversationsList: {
    padding: 10,
  },
  conversationItem: {
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
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
  searchResultsList: {
    padding: 10,
  },
  searchResultItem: {
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
  searchResultInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 14,
    color: '#666',
  },
  startConversationButton: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  startConversationText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
