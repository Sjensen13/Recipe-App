# Recipe App Backend

Node.js/Express backend for the Recipe Social Media App.

## Features

- RESTful API endpoints
- User authentication with JWT
- File upload and image processing
- Real-time messaging
- Recipe search integration
- AI ingredient detection
- Rate limiting and security

## Tech Stack

- Node.js with Express
- Supabase/PostgreSQL for database
- JWT for authentication
- Multer for file uploads
- Sharp for image processing
- Google Vision API for AI
- Winston for logging

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
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

3. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Project Structure

```
src/
├── controllers/         # Request handlers
│   ├── auth/           # Authentication controllers
│   ├── posts/          # Post controllers
│   ├── users/          # User controllers
│   ├── comments/       # Comment controllers
│   ├── likes/          # Like controllers
│   ├── messages/       # Message controllers
│   ├── recipes/        # Recipe controllers
│   └── hashtags/       # Hashtag controllers
├── routes/             # API routes
├── middleware/         # Custom middleware
├── services/           # Business logic
├── models/             # Data models
├── utils/              # Utility functions
├── config/             # Configuration files
└── types/              # Type definitions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get posts with pagination
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/posts` - Get user posts

### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment

### Likes
- `POST /api/likes` - Like/unlike post
- `GET /api/likes/post/:postId` - Get post likes

### Messages
- `GET /api/messages` - Get user conversations
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send message

### Recipes
- `GET /api/recipes/search` - Search recipes by ingredients
- `POST /api/recipes/detect` - Detect ingredients from image

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Development Guidelines

- Use async/await for database operations
- Implement proper error handling
- Add input validation
- Use middleware for authentication
- Follow RESTful API conventions
- Add comprehensive logging 