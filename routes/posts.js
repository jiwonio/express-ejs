// routes/posts.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../modules/validator');
const Post = require('../models/post');
const { role, permission } = require('../modules/authorizer');
const { logger } = require('../modules/logger');

// Post validation rules
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long')
];

/**
 * GET /posts - Get all posts with pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.getAllPosts({ limit, offset }),
      Post.getPostCount()
    ]);

    res.success('Posts retrieved successfully', {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error retrieving posts:', error);
    next(error);
  }
});

/**
 * GET /posts/:id - Get post by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findPostById(postId);

    if (!post) {
      return res.error('Post not found', 404);
    }

    res.success('Post retrieved successfully', post);
  } catch (error) {
    logger.error('Error retrieving post:', error);
    next(error);
  }
});

/**
 * GET /posts/user/:userId - Get posts by user ID
 */
router.get('/user/:userId', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.getPostsByUserId(userId, { limit, offset }),
      Post.getPostCountByUserId(userId)
    ]);

    res.success('Posts retrieved successfully', {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error retrieving user posts:', error);
    next(error);
  }
});

/**
 * POST /posts - Create a new post
 */
router.post('/', permission('create:posts'), validate(postValidation), async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.error('Unauthorized', 401);
    }

    const { title, content } = req.body;
    const user_id = req.user.id;

    const postId = await Post.createPost({
      user_id,
      title,
      content
    });

    const newPost = await Post.findPostById(postId);
    
    res.success('Post created successfully', newPost);
  } catch (error) {
    logger.error('Error creating post:', error);
    next(error);
  }
});

/**
 * PUT /posts/:id - Update a post
 */
router.put('/:id', permission('update:posts'), validate(postValidation), async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const { title, content } = req.body;

    // Check if post exists
    const post = await Post.findPostById(postId);
    if (!post) {
      return res.error('Post not found', 404);
    }

    // Check if user is authorized to update this post
    if (req.user.role !== 'admin' && post.user_id !== req.user.id) {
      return res.error('Forbidden: You do not have permission to update this post', 403);
    }

    // Update post
    const updatedPost = await Post.updatePost(postId, { title, content });
    
    res.success('Post updated successfully', updatedPost);
  } catch (error) {
    logger.error('Error updating post:', error);
    next(error);
  }
});

/**
 * DELETE /posts/:id - Delete a post
 */
router.delete('/:id', permission('delete:posts'), async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);

    // Check if post exists
    const post = await Post.findPostById(postId);
    if (!post) {
      return res.error('Post not found', 404);
    }

    // Check if user is authorized to delete this post
    if (req.user.role !== 'admin' && post.user_id !== req.user.id) {
      return res.error('Forbidden: You do not have permission to delete this post', 403);
    }

    // Delete post
    await Post.deletePost(postId);
    
    res.success('Post deleted successfully');
  } catch (error) {
    logger.error('Error deleting post:', error);
    next(error);
  }
});

module.exports = router;