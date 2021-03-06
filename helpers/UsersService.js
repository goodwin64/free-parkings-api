const uuidV4 = require('uuid/v4');
const fs = require('fs');
const path = require('path');

const { ROLE_ADMIN, ROLE_DRIVER } = require('../types/user');
const defaultUsers = require('../models/users.json');
const CarService = require('./CarService');


class UsersService {
  constructor() {
    this.users = [...defaultUsers];
    this.personalInfoKeys = new Set([
      'imageUrl',
      'username',
      'fullname',
      'gender',
      'defaultCountry',
      'role',
    ]);
  }

  createUser({ username = '', password = '', imageUrl = '', gender = '' }) {
    if (!username || !password) {
      return null;
    }

    return {
      authInfo: {
        accessToken: null,
        password,
      },
      personalInfo: {
        id: uuidV4().slice(0, 5).concat('-' + this.users.length),
        role: ROLE_DRIVER,
        username,
        imageUrl,
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

  deleteUser(userToDelete) {
    const userIndex = this.users.findIndex((user) => this.getId(user) === this.getId(userToDelete));
    this.users.splice(userIndex, 1);
    this.saveUsersInDB();
  }

  saveUsersInDB() {
    const usersJSON = JSON.stringify(this.users, null,  2);
    fs.writeFile(path.join(__dirname, '../models/users.json'), usersJSON, 'utf8', console.log);
  }

  getUserByUsername(username) {
    return this.users.find((user) => user.personalInfo.username === username);
  }

  getUserByCredentials(username, password) {
    return this.users.find((user) => user.personalInfo.username === username && user.authInfo.password === password);
  }

  getUserByAccessToken(accessToken) {
    return this.users.find((user) => user.authInfo.accessToken === accessToken);
  }

  getUserById(id) {
    return this.users.find((user) => user.personalInfo.id === id);
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
      && user.authInfo && user.authInfo.password
      && user.personalInfo && user.personalInfo.role && user.personalInfo.username
    );
  }

  getId(user) {
    return user.personalInfo.id;
  }

  getUserPublicInfo(user) {
    return user.personalInfo;
  }

  getSuccessfulLoginData(user) {
    return {
      accessToken: user.authInfo.accessToken,
      personalInfo: user.personalInfo,
    };
  }

  getAllUsers() {
    return this.users;
  }

  isAdmin(user) {
    return this.isValidUser(user) && user.personalInfo.role === ROLE_ADMIN;
  }

  isTheSameUser(user1, user2) {
    return this.isValidUser(user1) && this.isValidUser(user2) && user1.id === user2.id;
  }

  updatePersonalInfoField(user, key, value) {
    if (this.personalInfoKeys.has(key)) {
      user.personalInfo[key] = value;
    }
  }

  updatePersonalInfoAllFields(user, fieldsToUpdate) {
    Object
      .keys(fieldsToUpdate)
      .forEach(key => this.updatePersonalInfoField(user, key, fieldsToUpdate[key]));
    this.saveUsersInDB();
  }

  onSuccessAuth(user) {
    user.authInfo.accessToken = this.createAccessToken();
    this.saveUsersInDB();
  }

  getCarInfo(user) {
    return user && user.carInfo;
  }

  updateAllCarParameters(user, newCarParameters) {
    const preparedCarParameters = CarService.getPreparedCarParameters(newCarParameters);
    user.carInfo = {
      ...user.carInfo,
      ...preparedCarParameters,
    };
    this.saveUsersInDB();
  }
}

module.exports = new UsersService();
