const { getSupabase } = require('../services/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw error;
    }
    
    return data;
  }

  static async findByEmail(email) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw error;
    }
    
    return data;
  }

  static async findById(id) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw error;
    }
    
    return data;
  }

  static async create(userData) {
    try {
      console.log('🔍 User.create called with:', userData);
      const { username, email, password, name } = userData;
      const supabase = getSupabase();
      
      // Check if username already exists
      console.log('🔍 Checking if username exists:', username);
      const existingUsername = await this.findByUsername(username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }
      
      // Check if email already exists
      console.log('🔍 Checking if email exists:', email);
      const existingEmail = await this.findByEmail(email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
      
      // Hash password
      console.log('🔍 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 12);
      
      console.log('🔍 Inserting user into database...');
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username,
            email,
            password: hashedPassword,
            name
          }
        ])
        .select()
        .single();
      
      console.log('🔍 Insert result:', { data, error });
      
      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      // Remove password from returned data
      const { password: _, ...userWithoutPassword } = data;
      console.log('✅ User created successfully:', userWithoutPassword);
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Error in User.create:', error);
      throw error;
    }
  }

  static async authenticate(username, password) {
    const supabase = getSupabase();
    // Try to find user by username first
    let user = await this.findByUsername(username);
    
    // If not found by username, try email
    if (!user) {
      user = await this.findByEmail(username);
    }
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Remove password from returned data
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async update(id, updateData) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Remove password from returned data
    const { password: _, ...userWithoutPassword } = data;
    return userWithoutPassword;
  }
}

module.exports = User; 