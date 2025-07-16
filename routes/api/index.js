// routes/api/index.js

const express = require('express');
const {uploader} = require("../../modules/uploader");
const router = express.Router();

/* GET '/api' */
router.get('/', function(req, res, next) {
  res.success('API is working', {
    hello: 'world!'
  });
});

router.post('/upload', uploader.sample.array('test'), (req, res, next) => {
  res.success('success', req?.file?.originalname || req?.files?.map(file => file.originalname) || [] );
});

module.exports = router;
