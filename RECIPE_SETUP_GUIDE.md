# Recipe System Setup Guide

This guide will help you set up the complete recipe system with AI-powered ingredient detection and search functionality.

## 🚀 Quick Start

### 1. Database Setup

First, set up the database tables in Supabase:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL scripts from `docs/database/RECIPES_SETUP.md`

### 2. Environment Variables

#### Server (.env)
```env
# Google Vision API (for ingredient detection)
GOOGLE_VISION_API_KEY=your_google_vision_api_key
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Spoonacular API (for external recipes)
SPOONACULAR_API_KEY=your_spoonacular_api_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Client (.env)
```env
# Google Vision API
REACT_APP_GOOGLE_VISION_API_KEY=your_google_vision_api_key

# Spoonacular API
REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_api_key

# Cloudinary
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. API Keys Setup

#### Google Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Vision API
4. Create a service account and download the JSON key
5. Set the environment variables with your service account details

#### Spoonacular API
1. Go to [Spoonacular](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your environment variables

#### Cloudinary
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your cloud name, API key, and API secret
4. Create an upload preset for unsigned uploads
5. Add all credentials to your environment variables

### 4. Start the Application

```bash
# Start the server
cd server
npm install
npm run dev

# Start the client (in a new terminal)
cd client
npm install
npm start
```

## 🎯 Features Overview

### ✅ Implemented Features

1. **Recipe Search**
   - Text search by name/description
   - AI-powered ingredient detection from images
   - Manual ingredient entry
   - Advanced filters (category, difficulty, time, servings)

2. **Recipe Creation**
   - Comprehensive form with validation
   - Image upload with Cloudinary
   - Dynamic ingredient/instruction fields
   - Tag management
   - Category and difficulty selection

3. **Recipe Display**
   - Beautiful recipe cards with images
   - Cooking time, servings, difficulty badges
   - Author information
   - Relevance scoring for ingredient searches

4. **Backend API**
   - Full CRUD operations for recipes
   - AI ingredient detection with Google Vision
   - External recipe search with Spoonacular
   - Local recipe search with relevance scoring

### 🔄 Next Features to Implement

1. **Recipe Detail Page**
   - Full recipe view with ingredients and instructions
   - Step-by-step cooking mode
   - Like/comment functionality
   - Share recipe feature

2. **Recipe Management**
   - Edit/delete user's own recipes
   - Recipe collections/folders
   - Draft recipes

3. **Social Features**
   - Recipe likes and comments
   - Recipe sharing
   - User profiles with recipe collections
   - Community features

## 🧪 Testing the System

### 1. Test Recipe Creation

1. Navigate to `/app/recipe-search`
2. Click "Create Recipe"
3. Fill out the form with test data
4. Upload an image
5. Submit the form

### 2. Test Recipe Search

1. Go to `/app/recipe-search`
2. Try text search with recipe names
3. Test ingredient search by uploading an image
4. Use filters to narrow results

### 3. Test AI Ingredient Detection

1. Take a photo of ingredients
2. Upload it in the ingredient detection tab
3. Verify detected ingredients are accurate
4. Search for recipes using detected ingredients

## 🔧 Troubleshooting

### Common Issues

1. **"Recipes table doesn't exist"**
   - Run the SQL scripts from `docs/database/RECIPES_SETUP.md`

2. **"Google Vision API error"**
   - Check your service account credentials
   - Ensure the Vision API is enabled
   - Verify environment variables are set correctly

3. **"Spoonacular API error"**
   - Check your API key
   - Verify you haven't exceeded the free tier limits

4. **"Cloudinary upload error"**
   - Check your Cloudinary credentials
   - Verify the upload preset is configured correctly

5. **"Authentication error"**
   - Make sure you're logged in
   - Check that Supabase auth is working

### Debug Commands

```bash
# Check server logs
cd server && npm run dev

# Check client console
# Open browser dev tools and check console

# Test API endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/recipes/categories
```

## 📱 Usage Flow

### For Users

1. **Search for Recipes**
   - Use text search for specific recipes
   - Upload ingredient photos for AI detection
   - Add ingredients manually
   - Apply filters to narrow results

2. **Create Recipes**
   - Fill out recipe details
   - Add ingredients and instructions
   - Upload recipe images
   - Add tags and categories

3. **Discover Recipes**
   - Browse search results
   - View recipe details
   - Save favorite recipes
   - Share with others

### For Developers

1. **Extend the System**
   - Add new recipe categories
   - Implement additional AI features
   - Create new search algorithms
   - Add social features

2. **Customize the UI**
   - Modify recipe cards
   - Update search interface
   - Add new filters
   - Improve mobile experience

## 🎨 Customization

### Styling

The recipe system uses Tailwind CSS. You can customize:

- Colors in `tailwind.config.js`
- Components in `client/src/components/recipe/`
- Layout in `client/src/pages/recipe/`

### Configuration

- Recipe categories in `server/src/controllers/recipes/index.js`
- AI detection settings in `server/src/services/ai/vision.js`
- Search algorithms in `server/src/services/ai/recipeSearch.js`

## 🚀 Deployment

### Production Setup

1. Set up production environment variables
2. Configure production database
3. Set up CDN for images
4. Configure API rate limiting
5. Set up monitoring and logging

### Performance Optimization

1. Enable image optimization
2. Implement caching strategies
3. Optimize database queries
4. Use CDN for static assets

## 📚 API Documentation

### Recipe Endpoints

- `GET /api/recipes` - Get all recipes with filters
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/:id` - Get a specific recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe
- `POST /api/recipes/detect-ingredients` - Detect ingredients from image
- `POST /api/recipes/search-by-ingredients` - Search recipes by ingredients
- `GET /api/recipes/categories` - Get recipe categories
- `GET /api/recipes/difficulties` - Get recipe difficulties

### Search Endpoints

- `GET /api/search/recipes` - Search recipes by text
- `GET /api/search/posts` - Search posts
- `GET /api/search/users` - Search users
- `GET /api/search/hashtags` - Search hashtags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Need Help?** Check the troubleshooting section or create an issue in the repository. 