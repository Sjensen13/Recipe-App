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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // For development with mock Supabase, allow any email/password combination
    // In production, this would use real Supabase authentication
    const mockUser = {
      id: '74ff4ba9-0a8b-47d8-b5c5-20c8e5ca1b0f',
      email: email,
      username: email.split('@')[0], // Use email prefix as username
      name: email.split('@')[0],
      user_metadata: {
        username: email.split('@')[0],
        name: email.split('@')[0]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Generate a mock JWT token
    const mockToken = `mock_jwt_token_${Date.now()}`;

    res.json({
      success: true,
      message: 'Login successful',
      token: mockToken,
      user: mockUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if username already exists
    const { data: existingUsername, error: usernameError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          name: name || username
        }
      }
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // Create user profile in custom users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        username: username,
        name: name || username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Note: We don't fail here because the auth user was created successfully
    }

    // Combine auth user with profile data
    const userData = {
      ...authData.user,
      ...userProfile
    };

    res.json({
      success: true,
      message: 'Registration successful',
      token: authData.session?.access_token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
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
  register,
  getEmailByUsername
}; 