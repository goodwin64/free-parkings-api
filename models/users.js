const uuidV4 = require('uuid/v4');

const ROLE_ADMIN = 'ADMIN';
const ROLE_DRIVER = 'DRIVER';

const users = [
  {
    credentials: {
      username: 'admin',
      password: 'admin',
    },
    authInfo: {
      role: ROLE_ADMIN,
      accessToken: uuidV4(),
    },
    personalInfo: {
      username: 'admin',
      avatarUrl: 'https://media.licdn.com/dms/image/C4E03AQEeds_cS96caQ/profile-displayphoto-shrink_200_200/0?e=1560384000&v=beta&t=AR3x3rpGS8Bd78VcN4ESM8cayyfrrXp8eG0ejjgQAUE',
      gender: 'male',
    },
  },
  {
    credentials: {
      username: 'driver',
      password: 'driver',
    },
    authInfo: {
      role: ROLE_DRIVER,
      accessToken: uuidV4(),
    },
    personalInfo: {
      username: 'driver',
      avatarUrl: 'https://ae01.alicdn.com/kf/HTB1wyP2KFXXXXbvXFXXq6xXFXXXX/Parzin-Oversized-Sunglasses-Women-Female-Polarized-Sunglasses-Black-Elegant-Shades-Driver-Driving-Glasses-With-Case-9515.jpg_50x50.jpg',
      gender: 'female',
    },
  },
];

module.exports = {
  users,
  ROLE_ADMIN,
  ROLE_DRIVER,
};
