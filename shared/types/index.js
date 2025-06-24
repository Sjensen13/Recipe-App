// User types
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Post types
export const POST_TYPES = {
  RECIPE: 'recipe',
  TIP: 'tip',
  STORY: 'story'
};

// Recipe types
export const RECIPE_CATEGORIES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  DESSERT: 'dessert',
  SNACK: 'snack',
  BEVERAGE: 'beverage'
};

export const DIETARY_RESTRICTIONS = {
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten-free',
  DAIRY_FREE: 'dairy-free',
  NUT_FREE: 'nut-free',
  KETO: 'keto',
  PALEO: 'paleo'
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  RECIPE: 'recipe'
};

// Notification types
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MESSAGE: 'message',
  RECIPE_MATCH: 'recipe_match'
};

// API Response types
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
};

// File upload types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50; 