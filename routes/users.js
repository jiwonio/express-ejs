// routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {role, permission} = require("../modules/authorizer");
const {validate} = require("../modules/validator");
const {body} = require("express-validator");
const {logger} = require("../modules/logger");

/**
 * GET /users - Get all users (admin only)
 */
router.get('/', role('admin'), permission('read:users'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.getAllUsers({ limit, offset }),
      User.getUserCount()
    ]);

    res.success('Users retrieved successfully', {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error retrieving users:', error);
    next(error);
  }
});

/**
 * GET /users/:id - Get user by ID
 */
router.get('/:id', permission('read:users'), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Only allow users to view their own profile unless they have permission
    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      return res.error('Forbidden: You do not have permission to view this user', 403);
    }

    const user = await User.findUserById(userId);

    if (!user) {
      return res.error('User not found', 404);
    }

    res.success('User retrieved successfully', user);
  } catch (error) {
    logger.error('Error retrieving user:', error);
    next(error);
  }
});

module.exports = router;
