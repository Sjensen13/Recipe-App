const { getSupabase } = require('../services/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Auth middleware: Received token:', token);

    if (!token) {
      console.log('Auth middleware: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Get the Supabase client from the database service
    const supabase = getSupabase();
    console.log('Auth middleware: Got supabase client:', !!supabase);
    console.log('Auth middleware: Supabase auth available:', !!supabase.auth);
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('Auth middleware: Auth result:', { user: !!user, error: !!error });
    
    if (error || !user) {
      console.log('Auth middleware: Authentication failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.log('Auth middleware: Authentication successful, user:', user.id);
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
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
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
};

module.exports = {
  authenticateToken,
  optionalAuth
}; 