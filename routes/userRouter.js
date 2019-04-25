const express = require('express');
const router = express.Router();

const UsersService = require('../helpers/UsersService');


router.get('/', function (req, res) {
  const userThatMadeRequest = UsersService.getUserByAccessToken(req.headers.access_token);
  if (UsersService.isAdmin(userThatMadeRequest)) {
    res.status(200);
    res.json(UsersService.getAllUsers().map(UsersService.getUserPublicInfo));
  } else {
    res.status(403);
    res.json('access denied');
  }
});


router.get('/:id', function (req, res) {
  const user = UsersService.getUserById(Number(req.params.id));
  const userThatMadeRequest = UsersService.getUserByAccessToken(req.headers.access_token);
  if (UsersService.isAdmin(userThatMadeRequest) || UsersService.isTheSameUser(user, userThatMadeRequest)) {
    res.status(200);
    res.json(UsersService.getUserPublicInfo(user));
  } else {
    res.status(403);
    res.json('access denied');
  }
});


router.post('/:id', function (req, res) {
  const user = UsersService.getUserById(Number(req.params.id));
  const userThatMadeRequest = UsersService.getUserByAccessToken(req.headers.access_token);
  const personalInfoFields = { ...req.body };
  if (UsersService.isAdmin(userThatMadeRequest) || UsersService.isTheSameUser(user, userThatMadeRequest)) {
    UsersService.updatePersonalInfoAllFields(user, personalInfoFields);
    res.status(200);
    res.json('personal info has been updated');
  } else {
    res.status(403);
    res.json('unable to update personal info');
  }
});


module.exports = router;
