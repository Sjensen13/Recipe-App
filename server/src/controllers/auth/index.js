const { supabase } = require('../../services/supabase/client');

const getMe = async (req, res) => {
  try {
    // User is already authenticated and attached to req.user by middleware
    const user = req.user;

    // Get additional user profile data from your custom users table if needed
    // This is optional - you can store additional user data in Supabase user_metadata
    // or in a separate users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Profile fetch error:', error);
    }

    // Combine Supabase user data with custom profile data
    const userData = {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      user_metadata: user.user_metadata,
      ...profile // Include custom profile data if it exists
    };

    res.json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, name, bio, avatar_url } = req.body;

    // Update user metadata in Supabase auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          username,
          name,
          bio,
          avatar_url
        }
      }
    );

    if (authError) {
      console.error('Auth update error:', authError);
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    // Optionally update custom users table if you're using one
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        username,
        name,
        bio,
        avatar_url,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createProfile = async (req, res) => {
  try {
    const { username, name, email } = req.body;
    const userId = req.user?.id;

    // If no user ID from auth, try to find user by email
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        throw new Error('Failed to fetch users');
      }
      const user = authUser.users.find(u => u.email === email);
      if (user) {
        targetUserId = user.id;
      }
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', targetUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Profile check error:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check existing profile'
      });
    }

    if (existingProfile) {
      return res.status(200).json({
        success: true,
        message: 'Profile already exists'
      });
    }

    // Create user profile in custom users table
    const { data: profile, error: createError } = await supabase
      .from('users')
      .insert({
        id: targetUserId,
        email: email,
        username: username,
        name: name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Profile creation error:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user profile'
      });
    }

    res.json({
      success: true,
      message: 'User profile created successfully',
      data: { profile }
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required'
      });
    }

    // Try to find user by username (case-insensitive)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, username')
      .ilike('username', username) // <-- case-insensitive
      .single();

    // Debug log
    console.log('Login attempt:', { username, userProfile, profileError });

    let userEmail = null;

    if (userProfile) {
      userEmail = userProfile.email;
    } else {
      // If not found by username, check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(username)) {
        userEmail = username;
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or email'
        });
      }
    }

    // Log the email and password length before auth call
    console.log('Email for auth: [' + userEmail + '], password length:', password.length);

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      email: userEmail,
      user: authData.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getEmailByUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Look up the user by username in our custom users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('email')
      .eq('username', username)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Username not found'
        });
      }
      console.error('Profile lookup error:', profileError);
      return res.status(500).json({
        success: false,
        message: 'Error looking up user'
      });
    }

    res.json({
      success: true,
      message: 'Email found',
      email: userProfile.email
    });
  } catch (error) {
    console.error('Get email by username error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getMe,
  updateProfile,
  createProfile,
  login,
  getEmailByUsername
}; 