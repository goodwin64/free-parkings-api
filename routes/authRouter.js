const express = require('express');
const router = express.Router();


const validCred = {
  email: 'groupmanager@a.b',
  password: '123',
};

router.post('/', function(req, res) {
  if (req.body.email === validCred.email && req.body.password === validCred.password) {
    res.send('ok');
  } else {
    res.status(403);
    res.send('not ok');
  }
});

module.exports = router;
