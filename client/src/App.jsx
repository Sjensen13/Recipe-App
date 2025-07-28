import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/theme/ThemeContext';
import { NotificationProvider } from './context/notification/NotificationContext';
import { AuthProvider } from './context/auth/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/feed/Home';
import Explore from './pages/explore/Explore';
import MyProfile from './pages/profile/MyProfile';
import UserProfile from './pages/profile/UserProfile';
import PostDetail from './pages/post/PostDetail';
import CreatePost from './pages/post/CreatePost';
import Messages from './pages/messaging/Messages';
import RecipeSearch from './pages/recipe/RecipeSearch';
import CreateRecipe from './pages/recipe/CreateRecipe';
import Notifications from './pages/Notifications';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="home" element={<Home />} />
              <Route path="explore" element={<Explore />} />
              <Route path="create-post" element={<CreatePost />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="recipe-search" element={<RecipeSearch />} />
              <Route path="recipe/create" element={<CreateRecipe />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="profile/:userId" element={<UserProfile />} />
              <Route path="post/:postId" element={<PostDetail />} />
            </Route>
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App; 