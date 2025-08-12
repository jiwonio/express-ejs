// routes/index.js

import express from 'express';
const router = express.Router();

/* GET '/' */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

/* GET '/login' */
router.get('/login', (req, res, next) => {
  res.success('Login page');
});

export default router;