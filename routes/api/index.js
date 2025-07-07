const express = require('express');
const router = express.Router();

/* GET '/api' */
router.get('/', function(req, res, next) {
  res.success('API is working', {
    hello: 'world!'
  });
});

module.exports = router;
