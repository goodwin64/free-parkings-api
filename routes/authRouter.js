const express = require('express');
const router = express.Router();

const UsersService = require('../helpers/UsersService');


router.post('/login', function (req, res) {
  const user = UsersService.getUserByCredentials(req.body.username, req.body.password);
  if (user) {
    user.authInfo.accessToken = UsersService.createAccessToken();
    res.status(200);
    res.json(UsersService.getUserPublicInfo(user));
  } else {
    res.status(403);
    res.json('wrong username or password');
  }
});


router.post('/logout', function (req, res) {
  const user = UsersService.getUserByAccessToken(req.body.accessToken);
  if (UsersService.isValidUser(user)) {
    UsersService.clearAccessToken(user);
    res.status(200);
    res.json('logout successful');
  } else {
    res.status(403);
    res.json('cannot logout');
  }
});


router.post('/signup', function (req, res) {
  const username = req.body.username;
  if (UsersService.isUserExist(username)) {
    res.status(403);
    res.json(`username "${username}" already exists`);
    return;
  }

  const userCreated = UsersService.createUser(req.body);
  if (userCreated) {
    UsersService.addUser(userCreated);
    res.json('sign up successful');
  } else {
    res.status(403);
    res.json('invalid parameters');
  }
});

module.exports = router;
