import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth/AuthContext';
import { ThemeProvider } from './context/theme/ThemeContext';
import { NotificationProvider } from './context/notification/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Feed from './pages/feed/Feed';
import Explore from './pages/explore/Explore';
import Profile from './pages/profile/Profile';
import PostDetail from './pages/post/PostDetail';
import CreatePost from './pages/post/CreatePost';
import Messages from './pages/messaging/Messages';
import RecipeSearch from './pages/recipe/RecipeSearch';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Feed />} />
              <Route path="explore" element={<Explore />} />
              <Route path="profile/:userId" element={<Profile />} />
              <Route path="post/:postId" element={<PostDetail />} />
              <Route path="create-post" element={<CreatePost />} />
              <Route path="messages" element={<Messages />} />
              <Route path="recipe-search" element={<RecipeSearch />} />
            </Route>
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App; 