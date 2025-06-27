/**
 * Utility to check if all required configurations are properly set up
 */
export const checkConfig = () => {
  const config = {
    api: {
      url: process.env.REACT_APP_API_URL,
      status: !!process.env.REACT_APP_API_URL ? '✅' : '❌'
    },
    supabase: {
      url: process.env.REACT_APP_SUPABASE_URL,
      anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
      status: !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY) ? '✅' : '❌'
    },
    cloudinary: {
      cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
      status: !!(process.env.REACT_APP_CLOUDINARY_CLOUD_NAME && process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET) ? '✅' : '❌'
    }
  };

  // Check for placeholder values
  const hasPlaceholders = 
    config.cloudinary.cloudName === 'your_cloudinary_cloud_name' ||
    config.cloudinary.uploadPreset === 'your_upload_preset';

  if (hasPlaceholders) {
    config.cloudinary.status = '⚠️';
    config.cloudinary.warning = 'Placeholder values detected. Please update with real Cloudinary credentials.';
  }

  console.log('🔧 Configuration Check:');
  console.log('API URL:', config.api.status, config.api.url);
  console.log('Supabase:', config.supabase.status, config.supabase.url ? 'Configured' : 'Missing');
  console.log('Cloudinary:', config.cloudinary.status, config.cloudinary.cloudName ? 'Configured' : 'Missing');
  
  if (config.cloudinary.warning) {
    console.warn('⚠️', config.cloudinary.warning);
  }

  return config;
};

/**
 * Check if user is authenticated
 */
export const checkAuth = async (supabase) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;
    
    console.log('🔐 Authentication Status:', isAuthenticated ? '✅ Logged In' : '❌ Not Logged In');
    
    if (isAuthenticated) {
      console.log('User ID:', session.user.id);
      console.log('Email:', session.user.email);
    }
    
    return isAuthenticated;
  } catch (error) {
    console.error('❌ Auth check failed:', error);
    return false;
  }
};

/**
 * Run complete system check
 */
export const runSystemCheck = async (supabase) => {
  console.log('🚀 Running System Check...\n');
  
  const config = checkConfig();
  const isAuth = await checkAuth(supabase);
  
  console.log('\n📊 Summary:');
  console.log('Configuration:', config.cloudinary.status === '✅' && config.supabase.status === '✅' ? '✅ Ready' : '❌ Issues Found');
  console.log('Authentication:', isAuth ? '✅ Ready' : '❌ Login Required');
  
  if (config.cloudinary.status !== '✅') {
    console.log('\n🔧 To fix Cloudinary issues:');
    console.log('1. Follow the setup guide in CLOUDINARY_SETUP.md');
    console.log('2. Update your .env file with real Cloudinary credentials');
    console.log('3. Restart your development server');
  }
  
  if (!isAuth) {
    console.log('\n🔐 To fix authentication:');
    console.log('1. Make sure you\'re logged in to the app');
    console.log('2. Check that Supabase is properly configured');
  }
  
  return {
    config,
    isAuthenticated: isAuth,
    ready: config.cloudinary.status === '✅' && config.supabase.status === '✅' && isAuth
  };
}; 