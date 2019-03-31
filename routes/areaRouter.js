var express = require('express');
var router = express.Router();


const response = {
  timestamp: 0,
  updates: 0,
};

router.get('/', function(req, res) {
  res.send('area');
});

router.get('/checkUpdates/', function(req, res) {
  res.send(response);
});

module.exports = router;
