const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');

const users = require('../models/users').users;
const ROLE_DRIVER = require('../models/users').ROLE_DRIVER;


function findUserByCredentials(username, password) {
  return users.find((user) => user.credentials.username === username && user.credentials.password === password);
}

router.post('/login', function (req, res) {
  const userByCredentials = findUserByCredentials(req.body.username, req.body.password);
  if (userByCredentials) {
    res.status(200);
    res.json({
      authInfo: userByCredentials.authInfo,
      personalInfo: userByCredentials.personalInfo,
    });
  } else {
    res.status(403);
    res.json('wrong username or password');
  }
});


router.post('/logout', function (req, res) {
  const user = users.find((user) => user.authInfo.accessToken === req.body.accessToken);
  if (user) {
    user.authInfo.accessToken = null;
    res.status(200);
    res.json('logout successful');
  } else {
    res.status(403);
    res.json('cannot logout');
  }
});


function isUserExist(username) {
  return Boolean(users.find((user) => user.personalInfo.username === username));
}

function createUser({ username = '', password = '', avatarUrl = '', gender = '' }) {
  if (!username || !password) {
    return null;
  }

  return {
    credentials: {
      username,
      password,
    },
    authInfo: {
      role: ROLE_DRIVER,
      accessToken: uuidV4(),
    },
    personalInfo: {
      username,
      avatarUrl,
      gender,
    },
  };
}

router.post('/signup', function (req, res) {
  const username = req.body.username;
  if (isUserExist(username)) {
    res.status(403);
    res.json(`username ${username} already exists`);
  } else {
    const userCreated = createUser(req.body);
    if (userCreated) {
      users.push();
      res.json('sign up successful');
    } else {
      res.status(403);
      res.json('invalid parameters');
    }
  }
});

module.exports = router;
