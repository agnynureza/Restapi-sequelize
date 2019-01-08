var express = require('express');
var router = express.Router();
const data = require('../controller/dataController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Welcome to Express' );
});

router.use('/search', data.sendAllRespond)

module.exports = router;
