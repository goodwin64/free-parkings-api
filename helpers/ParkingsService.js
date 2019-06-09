const fs = require('fs');
const path = require('path');
const uuidV4 = require('uuid/v4');
const isNull = require('lodash/isNull');
const distance = require('@turf/distance');
const isString = require('lodash/isString');
const isNumber = require('lodash/isNumber');

const parkingsList = require('../models/parkings.json');
let freeParkingsIds = require('../models/free-parkings.json');


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
      length: isNumber,
      width: isNumber,
      height: isNumber,
      costPerHour: (prop) => typeof prop === 'number' || isNull(prop),
      maxStayDuration: isNumber,
      restrictions: (prop) => Array.isArray(prop) && prop.every(isString),
      features: (prop) => Array.isArray(prop) && prop.every(isString),
    };
  }

  saveParkingsInDB() {
    const parkingsJSON = JSON.stringify(this.parkingsList, null, 2);
    fs.writeFile(path.join(__dirname, '../models/parkings.json'), parkingsJSON, 'utf8', console.log);
  }

  saveParkingAvailabilityInDB(parkingId, isFree) {
    debugger;
    const freeParkingsIdsSet = new Set(freeParkingsIds);
    if (isFree) {
      freeParkingsIdsSet.add(parkingId)
    } else {
      freeParkingsIdsSet.delete(parkingId);
    }
    const newParkingIds = [...freeParkingsIdsSet];
    const newParkingIdsJSON = JSON.stringify(newParkingIds, null, 2);
    freeParkingsIds = newParkingIds;
    fs.writeFile(path.join(__dirname, '../models/free-parkings.json'), newParkingIdsJSON, 'utf8', console.log);
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
    const isInvalidType = !validator || !validator(parkingParameterValue);
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
      this.saveParkingAvailabilityInDB(preparedParking.id, rawParking.isFree);
      return this.addAvailablityInfoToParking(preparedParking);
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
      this.saveParkingAvailabilityInDB(parkingId, newParameters.isFree);
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
    return this.parkingsList
      .filter((p) => {
        const doesParkingFitByDistance = this.getDistance(...p.geometry[0], lat, lon) <= radius;
        return doesParkingFitByDistance;
      })
      .map(this.addAvailablityInfoToParking);
  }

  static getParkingAvailability(parking) {
    return freeParkingsIds.includes(parking.id);
  }

  addAvailablityInfoToParking(p) {
    return {
      ...p,
      isFree: ParkingsService.getParkingAvailability(p),
    };
  }

  getAllParkings() {
    return this.parkingsList;
  }
}

module.exports = new ParkingsService();
