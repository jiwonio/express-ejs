// routes/index.js

const express = require('express');
const router = express.Router();

/* GET '/' */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

/* GET '/login' */
router.get('/login', (req, res, next) => {
  res.success('Login page');
});

module.exports = router;
