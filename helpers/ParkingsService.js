const distance = require('@turf/distance');
const fs = require('fs');
const path = require('path');

const parkingsList = require('../models/parkings.json');


class ParkingsService {
  constructor() {
    this.parkingsList = [...parkingsList];

    this.parkingSchema = {
      id: 'string',
      geometry: 'object',
      length: 'number',
      width: 'number',
      height: 'number',
      costPerHour: 'number',
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
    const isInvalidType = typeof parkingParameterValue !== this.parkingSchema[parkingParameterKey];

    if (isKeyUnknown || isInvalidType) {
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
    const preparedParking = {
      ...this.getPreparedParking(rawParking),
      id: this.parkingsList.length + 1,
    };
    this.parkingsList.push(preparedParking);
    this.saveParkingsInDB();
    return preparedParking;
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
