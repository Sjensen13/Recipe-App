const { getSupabase } = require('../../services/database');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Check if this is a mock token (for development)
    if (token.startsWith('mock_jwt_token_')) {
      // Mock user for development
      req.user = {
        id: '74ff4ba9-0a8b-47d8-b5c5-20c8e5ca1b0f',
        email: 'test@example.com',
        username: 'test',
        name: 'Test User',
        user_metadata: {
          username: 'test',
          name: 'Test User'
        }
      };

      return next();
    }

    // Get the Supabase client from the database service
    const supabase = getSupabase();
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Check if this is a mock token (for development)
      if (token.startsWith('mock_jwt_token_')) {
        // Mock user for development
        req.user = {
          id: '74ff4ba9-0a8b-47d8-b5c5-20c8e5ca1b0f',
          email: 'test@example.com',
          username: 'test',
          name: 'Test User',
          user_metadata: {
            username: 'test',
            name: 'Test User'
          }
        };
        return next();
      }

      const supabase = getSupabase();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we just continue without user data
    next();
  }
}

module.exports = { authenticateToken, optionalAuth }; 