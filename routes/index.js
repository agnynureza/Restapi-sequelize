const express = require('express');
const router = express.Router();
const cache = require('../middleware/cache')
const data = require('../controller/dataController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Welcome to Express' );
});

router.get('/people-like-you',cache, data)

module.exports = router;
