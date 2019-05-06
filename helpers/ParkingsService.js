const fs = require('fs');
const path = require('path');
const uuidV4 = require('uuid/v4');
const isNull = require('lodash/isNull');
const distance = require('@turf/distance');
const isString = require('lodash/isString');

const parkingsList = require('../models/parkings.json');


function isValidCoordinate(coord, index) {
  if (index === 0) {
    return isFinite(coord) && coord >= -90 && coord <= 90;
  } else if (index === 1) {
    return isFinite(coord) && coord >= -180 && coord <= 180;
  }
  return false;
}

function isValidPoint(point) {
  return Array.isArray(point) && point.length === 2 && point.every(isValidCoordinate);
}

class ParkingsService {
  constructor() {
    this.parkingsList = [...parkingsList];

    this.parkingSchema = {
      id: isString,
      geometry: (prop) => Array.isArray(prop) && prop.every(isValidPoint),
      length: (prop) => typeof prop === 'number',
      width: (prop) => typeof prop === 'number',
      height: (prop) => typeof prop === 'number',
      costPerHour: (prop) => typeof prop === 'number' || isNull(prop),
      maxStayDuration: (prop) => typeof prop === 'number',
      restrictions: (prop) => Array.isArray(prop) && prop.every(isString),
      features: (prop) => Array.isArray(prop) && prop.every(isString),
    };
  }

  saveParkingsInDB() {
    const parkingsJSON = JSON.stringify(this.parkingsList, null, 2);
    fs.writeFile(path.join(__dirname, '../models/parkings.json'), parkingsJSON, 'utf8', console.log);
  }

  getPreparedParking(rawParkingParameters) {
    return Object
      .keys(rawParkingParameters)
      .reduce((acc, key) => ({
        ...acc,
        ...this.prepareParkingParameter(key, rawParkingParameters[key]),
      }), {});
  }

  prepareParkingParameter(parkingParameterKey, parkingParameterValue) {
    const isKeyUnknown = !parkingParameterKey in this.parkingSchema;
    if (isKeyUnknown) {
      return null;
    }

    const validator = this.parkingSchema[parkingParameterKey];
    const isInvalidType = !validator(parkingParameterValue);
    if (isInvalidType) {
      return null;
    }

    return {
      [parkingParameterKey]: parkingParameterValue,
    };
  }

  getParkingById(id) {
    return this.parkingsList.find((parking) => parking.id === id);
  }

  getParkingIndexById(id) {
    return this.parkingsList.findIndex((parking) => parking.id === id);
  }

  createParking(rawParking) {
    if (rawParking && Array.isArray(rawParking.geometry)) {
      const preparedParking = {
        ...this.getPreparedParking(rawParking),
        id: uuidV4().concat(this.parkingsList.length + 1),
      };
      this.parkingsList.push(preparedParking);
      this.saveParkingsInDB();
      return preparedParking;
    } else {
      return null;
    }
  }

  updateParking(parkingId, newParameters) {
    const parkingIndex = this.getParkingIndexById(parkingId);
    const parking = this.parkingsList[parkingIndex];
    const updatedParkingParameters = this.getPreparedParking(newParameters);

    if (parkingIndex !== -1 && Object.keys(updatedParkingParameters).length > 0) {
      this.parkingsList[parkingIndex] = {
        ...parking,
        ...updatedParkingParameters,
      };
      this.saveParkingsInDB();
      return true;
    }
    return false;
  }

  deleteParking(parkingId) {
    const parkingIndex = this.getParkingIndexById(parkingId);
    if (parkingIndex !== -1) {
      this.parkingsList.splice(parkingIndex, 1);
      this.saveParkingsInDB();
      return true;
    }
    return false;
  }

  deleteAllParkings() {
    this.parkingsList = [];
    this.saveParkingsInDB();
  }

  deleteParkingsInArea(lat, lon, radius) {
    const allWithoutParkingsInArea = this.parkingsList.filter((p) => this.getDistance(...p.geometry[0], lat, lon) > radius);
    if (allWithoutParkingsInArea.length < this.parkingsList.length) {
      this.parkingsList = allWithoutParkingsInArea;
      this.saveParkingsInDB();
      return true;
    }
    return false;
  }

  getDistance(lat1, lon1, lat2, lon2) {
    return distance([lon1, lat1], [lon2, lat2], { units: 'meters' });
  }

  getParkingsInArea(lat, lon, radius) {
    return this.parkingsList.filter((p) => this.getDistance(...p.geometry[0], lat, lon) <= radius);
  }

  getAllParkings() {
    return this.parkingsList;
  }
}

module.exports = new ParkingsService();
