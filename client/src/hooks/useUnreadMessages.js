import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth/AuthContext';
import { getUnreadCount } from '../services/api/messages';

const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const data = await getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const updateUnreadCount = (newCount) => {
    setUnreadCount(newCount);
  };

  const decrementUnreadCount = (amount = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount));
  };

  return {
    unreadCount,
    loading,
    fetchUnreadCount,
    updateUnreadCount,
    decrementUnreadCount
  };
};

export default useUnreadMessages; 