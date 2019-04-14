const uuidV4 = require('uuid/v4');
const fs = require('fs');
const path = require('path');

const { ROLE_ADMIN, ROLE_DRIVER } = require('../types/user');
const defaultUsers = require('../models/users.json');


class UsersService {
  constructor() {
    this.users = [...defaultUsers];
  }

  createUser({ username = '', password = '', avatarUrl = '', gender = '' }) {
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
        accessToken: null,
      },
      personalInfo: {
        username,
        avatarUrl,
        gender,
      },
    };
  }

  addUser(user) {
    if (this.isValidUser(user)) {
      this.users.push(user);
      this.saveUsersInDB();
    }
  }

  deleteUser(username) {
    const userIndex = this.users.findIndex((user) => this.getUsername(user) === username);
    this.users.splice(userIndex, 1);
    this.saveUsersInDB();
  }

  saveUsersInDB() {
    const usersJSON = JSON.stringify(this.users, null,  2);
    fs.writeFile(path.join(__dirname, '../models/users.json'), usersJSON, 'utf8', console.log);
  }

  getUserByUsername(username) {
    return this.users.find((user) => user.credentials.username === username);
  }

  getUserByCredentials(username, password) {
    return this.users.find((user) => user.credentials.username === username && user.credentials.password === password);
  }

  getUserByAccessToken(accessToken) {
    return this.users.find((user) => user.authInfo.accessToken === accessToken);
  }

  isUserExist(username) {
    return Boolean(this.getUserByUsername(username));
  }

  createAccessToken() {
    return uuidV4();
  }

  clearAccessToken(user) {
    user.authInfo.accessToken = null;
  }

  isValidUser(user) {
    return (
      Boolean(user)
      && user.credentials && user.credentials.username && user.credentials.password
      && user.authInfo && user.authInfo.role
      && user.personalInfo && user.personalInfo.username
    );
  }

  getUsername(user) {
    return user.personalInfo.username;
  }

  getUserPublicInfo(user) {
    return {
      authInfo: user.authInfo,
      personalInfo: user.personalInfo,
    };
  }

  getAllUsers() {
    return this.users;
  }
}

module.exports = new UsersService();
