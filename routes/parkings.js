const express = require('express');
const router = express.Router();

const ParkingsService = require('../helpers/ParkingsService');
const UsersService = require('../helpers/UsersService');


router.get('/', function (req, res, next) {
  const { lat, lon, radius } = req.query;
  if ('lat' in req.query && 'lon' in req.query && 'radius' in req.query) {
    res.json(ParkingsService.getParkingsInArea(+lat, +lon, +radius));
  } else {
    res.json(ParkingsService.getAllParkings());
  }
});


router.put('/', function (req, res, next) {
  const userThatMadeRequest = UsersService.getUserByAccessToken(req.headers.access_token);
  const parkingParameters = req.body;
  console.log('parkingParameters', parkingParameters);

  if (UsersService.isAdmin(userThatMadeRequest)) {
    const newParking = ParkingsService.createParking(parkingParameters);
    res.json(newParking);
  } else {
    res.json('access denied');
  }
});


router.delete('/', function (req, res, next) {
  const userThatMadeRequest = UsersService.getUserByAccessToken(req.headers.access_token);

  if (UsersService.isAdmin(userThatMadeRequest)) {
    const { lat, lon, radius } = req.query;
    if ('lat' in req.query && 'lon' in req.query && 'radius' in req.query) {
      const areParkingsDeleted = ParkingsService.deleteParkingsInArea(+lat, +lon, +radius);
      if (areParkingsDeleted) {
        res.status(200);
        res.json('all parkings in area deleted successfully');
      } else {
        res.status(404);
        res.json('nothing to delete');
      }
    } else {
      ParkingsService.deleteAllParkings();
      res.status(200);
      res.json('all parkings deleted successfully');
    }
  } else {
    res.status(403);
    res.json('access denied');
  }
});


router.get('/:id', function (req, res, next) {
  const parkingId = Number(req.params.id);
  res.json(ParkingsService.getParkingById(parkingId));
});


router.put('/:id', function (req, res, next) {
  const parkingId = Number(req.params.id);
  const userThatMadeRequest = UsersService.getUserByAccessToken(req.headers.access_token);
  const newParkingParameters = { ...req.body };

  if (UsersService.isAdmin(userThatMadeRequest)) {
    const isUpdatedSuccessfully = ParkingsService.updateParking(parkingId, newParkingParameters);
    if (isUpdatedSuccessfully) {
      res.json('updated successfully');
    } else {
      res.status(404);
      res.json(`unable to update parking with id {${parkingId}}`);
    }
  } else {
    res.status(403);
    res.json('access denied');
  }
});


router.delete('/:id', function (req, res, next) {
  const parkingId = Number(req.params.id);
  const userThatMadeRequest = UsersService.getUserByAccessToken(req.headers.access_token);

  if (UsersService.isAdmin(userThatMadeRequest)) {
    const isDeletedSuccessfully = ParkingsService.deleteParking(parkingId);
    if (isDeletedSuccessfully) {
      res.status(200);
      res.json('deleted successfully');
    } else {
      res.status(404);
      res.json(`unable to delete parking with id "${parkingId}"`);
    }
  } else {
    res.status(403);
    res.json('access denied');
  }
});


module.exports = router;
