// routes/examples/index.js

const express = require('express');
const router = express.Router();
const { logger } = require('../../modules/logger');
const { uploader } = require("../../modules/uploader");

/**
 * GET /examples
 */
router.get('/', (req, res) => {
  logger.info('Accessed route example', 'test1', 'test2', {'test3': 'test4'});
  res.success('Nested route example', {
    message: 'This is an example of a nested route',
    path: req.originalUrl,
    description: 'Routes can be organized in subdirectories and will be automatically loaded'
  });
});

/**
 * POST /examples/upload
 */
router.post('/upload', uploader.sample.array('test'), (req, res, next) => {
  res.success('success', req?.file?.originalname || req?.files?.map(file => file.originalname) || [] );
});


module.exports = router;