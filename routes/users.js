const express = require('express');
const router = express.Router();
const { getFooBar, getTotalCount, createFoobar } = require('../model/users');

/**
 * GET /
 */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * GET /users/sample
 */
router.get('/sample', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // 함수를 직접 호출
    const [users, total] = await Promise.all([
      getFooBar({ limit, offset }),
      getTotalCount()
    ]);

    res.success('success', {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /users/sample/:id
 */
router.get('/sample/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const users = await getFooBar({
      limit: 1,
      offset: 0,
      userId
    });

    if (!users || users.length === 0) {
      return res.error('Bad request.', 400);
    }

    res.success('success', users[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /users/sample
 */
router.post('/sample', async (req, res, next) => {
  try {
    const result = await createFoobar(
        { message: 'Hello, World!' },
        { comment: 'Hey, there!' }
    );
    console.log('success: ', result);
    res.success('success', result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
