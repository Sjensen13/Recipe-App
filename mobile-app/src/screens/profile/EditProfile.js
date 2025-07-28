import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { apiClient, uploadAPI } from '../../services/api';
import { useQueryClient } from 'react-query';

export default function EditProfile({ navigation, route }) {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.user_metadata?.name || '',
        username: user.username || user.user_metadata?.username || '',
        bio: user.bio || user.user_metadata?.bio || '',
        avatar_url: user.avatar_url || user.user_metadata?.avatar_url || '',
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        try {
          setUploadingImage(true);
          
          // Create form data for upload
          const formData = new FormData();
          formData.append('image', {
            uri: result.assets[0].uri,
            type: 'image/jpeg',
            name: 'avatar.jpg',
          });
          formData.append('type', 'avatar');

          // Upload image to server
          console.log('Uploading image with formData:', formData);
          const uploadResponse = await uploadAPI.uploadImage(formData);
          console.log('Upload response:', uploadResponse.data);
          const imageUrl = uploadResponse.data.url;

          setFormData(prev => ({
            ...prev,
            avatar_url: imageUrl,
          }));
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          console.error('Upload error response:', uploadError.response?.data);
          Alert.alert('Upload Error', uploadError.response?.data?.message || 'Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Saving profile data:', formData);
      console.log('Current user before update:', user);
      console.log('API client headers:', apiClient.defaults.headers);
      
      // Update profile on server
      const response = await apiClient.put('/auth/profile', formData);
      
      console.log('Profile update response:', response.data);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Update local user data with the server response data
      const updatedUser = await updateUser(response.data.data);
      console.log('User after update:', updatedUser);
      
      // Invalidate posts data to refresh the profile screen
      await queryClient.invalidateQueries(['userPosts', user?.id]);
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => {
          console.log('EditProfile - Navigating back with updated user:', updatedUser);
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            onPress={pickImage} 
            style={[styles.avatarContainer, uploadingImage && styles.avatarContainerDisabled]}
            disabled={uploadingImage}
          >
            {formData.avatar_url ? (
              <Image source={{ uri: formData.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={60} color="#ccc" />
              </View>
            )}
            <View style={styles.editAvatarButton}>
              {uploadingImage ? (
                <Ionicons name="hourglass" size={20} color="#fff" />
              ) : (
                <Ionicons name="camera" size={20} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>
            {uploadingImage ? 'Uploading...' : 'Tap to change photo'}
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              placeholder="Enter your username"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Tell us about yourself"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarContainerDisabled: {
    opacity: 0.6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarLabel: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
}); 