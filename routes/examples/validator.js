// routes/examples/validator.js

import express from 'express';
import { body, query, param } from 'express-validator';
import validate from '#utils/validator';

const router = express.Router();

/**
 * express-validator examples
 */

// Validation middleware
const validateUser = [
  body('username')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Username must be between 4 and 20 characters')
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .trim(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)
    .withMessage('Password must contain letters, numbers, and special characters'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Please enter a valid age'),

  body('phone')
    .optional()
    .matches(/^[0-9]{3}-?[0-9]{4}-?[0-9]{4}$/)
    .withMessage('Please enter a valid phone number')
];

// Signup route
router.post('/signup', validate(validateUser), async (req, res) => {
  try {
    const { username, email, age, phone } = req.body;
    // Actual signup logic implementation
    res.success('Registration successful', {
      user: { username, email, age, phone }
    });
  } catch (error) {
    res.error('Internal server error', 500);
  }
});

// URL parameter validation example
router.get('/user/:id', validate([
  param('id').isInt().withMessage('Invalid user ID')
]), (req, res) => {
  // User lookup logic
  res.success('User found', { userId: req.params.id });
});

// Query parameter validation example
router.get('/search', validate([
  query('keyword')
    .trim()
    .notEmpty()
    .withMessage('Search term is required')
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters long'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid page number')
]), (req, res) => {
  // Search logic
  res.success('Search results', {
    keyword: req.query.keyword,
    page: req.query.page || 1
  });
});

// Product validation example
router.post('/product', validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0')
    .custom((value) => {
      if (value % 0.01 !== 0) {
        throw new Error('Price must be in valid currency format');
      }
      return true;
    }),
  body('categories')
    .isArray()
    .withMessage('Categories must be an array')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('At least one category must be selected');
      }
      return true;
    })
]), (req, res) => {
  // Product creation logic
  res.success('Product created successfully', {
    product: req.body
  });
});

export default router;