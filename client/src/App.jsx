import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth/AuthContext';
import { ThemeProvider } from './context/theme/ThemeContext';
import { NotificationProvider } from './context/notification/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages - These will be created next
import Home from './pages/feed/Home';
import Explore from './pages/explore/Explore';
import Profile from './pages/profile/Profile';
import PostDetail from './pages/post/PostDetail';
import CreatePost from './pages/post/CreatePost';
import Messages from './pages/messaging/Messages';
import RecipeSearch from './pages/recipe/RecipeSearch';
import Notifications from './pages/Notifications';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes - Login page is now the default route */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/home" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Home page with general feed */}
              <Route index element={<Home />} />
            </Route>
            
            {/* Other protected routes */}
            <Route path="/explore" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Explore />} />
            </Route>
            
            <Route path="/create-post" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<CreatePost />} />
            </Route>
            
            <Route path="/messages" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Messages />} />
            </Route>
            
            <Route path="/notifications" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Notifications />} />
            </Route>
            
            <Route path="/recipe-search" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<RecipeSearch />} />
            </Route>
            
            <Route path="/profile/:userId" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Profile />} />
            </Route>
            
            <Route path="/post/:postId" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<PostDetail />} />
            </Route>
            
            {/* Fallback - redirect to login if not authenticated */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App; 