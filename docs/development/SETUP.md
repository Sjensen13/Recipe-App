# Development Setup Guide

This guide will help you set up the Recipe Social Media App for development.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- Supabase account (for database)
- Google Cloud account (for Vision API)
- Spoonacular API key (for recipe search)

## Initial Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Recipe-App
```

2. **Install dependencies for both client and server**
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. **Set up environment variables**

Create `.env` files in both `client/` and `server/` directories:

**client/.env:**
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_GOOGLE_VISION_API_KEY=your_google_vision_api_key
REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_api_key
```

**server/.env:**
```env
NODE_ENV=development
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
GOOGLE_VISION_API_KEY=your_google_vision_api_key
SPOONACULAR_API_KEY=your_spoonacular_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Database Setup

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Set up database tables**
   - Run the SQL scripts in `docs/database/schema.sql`
   - Or use the Supabase dashboard to create tables

## External Services Setup

### Google Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Vision API
4. Create credentials (API key)
5. Add the API key to your environment variables

### Spoonacular API
1. Go to [spoonacular.com](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Get your API key
4. Add the API key to your environment variables

### Cloudinary (Optional for image storage)
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create a free account
3. Get your cloud name, API key, and API secret
4. Add them to your environment variables

## Running the Application

1. **Start the backend server**
```bash
cd server
npm run dev
```

2. **Start the frontend development server**
```bash
cd client
npm start
```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Development Workflow

1. **Code Style**
   - Use ESLint for code linting
   - Follow the existing code style
   - Use Prettier for code formatting

2. **Git Workflow**
   - Create feature branches from `main`
   - Use descriptive commit messages
   - Submit pull requests for review

3. **Testing**
   - Write tests for new features
   - Run tests before committing
   - Maintain good test coverage

## Common Issues

### Port already in use
If you get "port already in use" errors:
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9
```

### Environment variables not loading
- Make sure `.env` files are in the correct directories
- Restart your development servers after adding new environment variables
- Check that variable names match what the code expects

### Database connection issues
- Verify your Supabase credentials
- Check that your database tables are created
- Ensure your IP is whitelisted in Supabase

## Next Steps

After setup, you can:
1. Explore the codebase structure
2. Read the API documentation
3. Check out the development guidelines
4. Start building features! 