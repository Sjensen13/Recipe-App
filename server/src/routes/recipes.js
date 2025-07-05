const express = require('express');
const { authenticateToken } = require('../middleware/auth/auth');
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  // detectIngredients,
  searchByIngredients,
  getCategories,
  getDifficulties
} = require('../controllers/recipes');

const router = express.Router();

// Apply authentication middleware to all routes
// router.use(authenticateToken);

// Recipe CRUD operations
router.post('/', createRecipe);
router.get('/', getRecipes);
router.get('/categories', getCategories);
router.get('/difficulties', getDifficulties);
router.get('/:id', getRecipeById);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

// AI-powered features
// Commented out: router.post('/detect-ingredients', detectIngredients);
router.post('/search-by-ingredients', searchByIngredients);

module.exports = router;
