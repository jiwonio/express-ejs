// routes/examples/index.js

import express from 'express';
import { logger } from '#utils/logger';
import uploader from '#utils/uploader';

const router = express.Router();

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

export default router;