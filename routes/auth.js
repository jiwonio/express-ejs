// routes/auth.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult} = require('express-validator');
const { validate } = require('../modules/validator');
const User = require('../models/user');
const { logger } = require('../modules/logger');

// Login validation rules
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
        .trim(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Registration validation rules
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
        .trim(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)
        .withMessage('Password must contain letters, numbers, and special characters')
];

// Password confirmation validation rule
const confirmPasswordValidation = [
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
];

/**
 * POST /auth/login - Process login form
 */
router.post('/login', validate(loginValidation), (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            logger.error('Login error:', err);
            return next(err);
        }

        if (!user) {
            // Handle API requests
            if (req.accepts('json')) {
                return res.error('Invalid email or password', 401);
            }
            // Handle web requests
            return res.redirect('/login?error=invalid');
        }

        // Log in the user
        req.logIn(user, (err) => {
            if (err) {
                logger.error('Error logging in user:', err);
                return next(err);
            }

            // Handle API requests
            if (req.accepts('json')) {
                return res.success('Login successful', { user });
            }

            // Handle web requests - redirect to the home page or the originally requested URL
            const redirectTo = req.session.returnTo || '/';
            delete req.session.returnTo;

            return res.redirect(redirectTo);
        });
    })(req, res, next);
});

/**
 * POST /auth/register - Process registration form
 */
router.post('/register', validate([...registerValidation, ...confirmPasswordValidation]), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.error('Email already in use', 400, req.body);
        }

        // Create the user
        const userId = await User.createUser({
            name,
            email,
            password,
            role: 'user'
        });

        res.success('Registration successful', { userId });
    } catch (error) {
        // Check for duplicate email error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.error('Email already in use', 400);
        }

        logger.error('Error registering user:', error);
        next(error);
    }
});

/**
 * GET /auth/logout - Log out the user
 */
router.get('/logout', (req, res, next) => {
    // Handle both session and token-based logout
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) {
                logger.error('Error logging out:', err);
                return next(err);
            }

            res.redirect('/login');
        });
    } else {
        res.redirect('/');
    }
});

// Export the router
module.exports = router;