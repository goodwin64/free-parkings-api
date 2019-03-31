var express = require('express');
var router = express.Router();

var mockParkings = require('../models/freeParkings');


/* GET parkings listing. */
router.get('/', function(req, res, next) {
  res.send(mockParkings);
});

module.exports = router;
