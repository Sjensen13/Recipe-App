import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/feed/HomeScreen';
import ExploreScreen from './src/screens/explore/ExploreScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import UserProfileScreen from './src/screens/profile/UserProfileScreen';
import MessagesScreen from './src/screens/messaging/MessagesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CreatePostScreen from './src/screens/post/CreatePostScreen';
import PostDetailScreen from './src/screens/post/PostDetailScreen';
import RecipeSearchScreen from './src/screens/recipe/RecipeSearchScreen';
import CreateRecipeScreen from './src/screens/recipe/CreateRecipeScreen';
import RecipeDetailScreen from './src/screens/recipe/RecipeDetailScreen';
import ConversationScreen from './src/screens/messaging/ConversationScreen';
import EditProfile from './src/screens/profile/EditProfile';

// Import contexts
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { NotificationProvider } from './src/context/NotificationContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// Bottom Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'RecipeSearch') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="Create" component={CreatePostScreen} options={{ title: 'Create' }} />
      <Tab.Screen name="RecipeSearch" component={RecipeSearchScreen} options={{ title: 'Recipes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Login"
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="MainApp" component={TabNavigator} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} />
                  <Stack.Screen name="Messages" component={MessagesScreen} />
                  <Stack.Screen name="PostDetail" component={PostDetailScreen} />
                  <Stack.Screen name="RecipeSearch" component={RecipeSearchScreen} />
                  <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
                  <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
                  <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                  <Stack.Screen 
                    name="EditProfile" 
                    component={EditProfile}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen 
                    name="Conversation" 
                    component={ConversationScreen}
                    options={{
                      headerShown: true,
                      headerBackTitle: 'Back',
                    }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
} 