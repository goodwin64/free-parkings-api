const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');


const users = [
  {
    credentials: {
      username: 'admin',
      password: 'admin',
    },
    authInfo: {
      role: 'admin', accessToken: uuidV4()
    },
  },
  {
    credentials: {
      username: 'driver',
      password: 'driver',
    },
    authInfo: {
      role: 'driver', accessToken: uuidV4()
    },
  },
];

function findUserByCredentials(username, password) {
  return users.find((user) => user.credentials.username === username && user.credentials.password === password);
}

router.post('/', function(req, res) {
  const userByCredentials = findUserByCredentials(req.body.username, req.body.password);
  if (userByCredentials) {
    res.json(userByCredentials.authInfo);
  } else {
    res.status(403);
    res.json('wrong username or password');
  }
});

module.exports = router;
