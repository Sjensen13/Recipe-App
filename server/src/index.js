const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const commentsRoutes = require('./routes/comments');
const likesRoutes = require('./routes/likes');
const messagesRoutes = require('./routes/messages');
const recipesRoutes = require('./routes/recipes');
const hashtagsRoutes = require('./routes/hashtags');
const uploadRoutes = require('./routes/upload');
const searchRoutes = require('./routes/search');
const notificationsRoutes = require('./routes/notifications');

const { errorHandler } = require('./middleware/errorHandler');
const { connectDatabase } = require('./services/database');

const app = express();
const PORT = process.env.PORT || 5002;

// Rate limiting - increased limit for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/hashtags', hashtagsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationsRoutes);

// --- TEST ROUTE: Spoonacular name search (remove after testing) ---
app.get('/api/test-spoonacular-name', async (req, res) => {
  try {
    const { searchExternalRecipesByName } = require('./services/ai/recipeSearch');
    const results = await searchExternalRecipesByName('chicken', 5);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- END TEST ROUTE ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 