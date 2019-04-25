const manufacturersList = require('../models/carManufacturers.json');


class CarService {
  constructor() {
    this.manufacturersSet = new Set(manufacturersList);

    this.carInfoSchema = {
      manufacturer: 'string',
      model: 'string',
      year: 'number',
      color: 'string',
      length: 'number',
      width: 'number',
      height: 'number',
    };
  }

  getPreparedCarParameters(rawCarParameters) {
    Object
      .keys(rawCarParameters)
      .reduce((acc, key) => ({
        ...acc,
        ...this.prepareCarParameter(key, rawCarParameters[key]),
      }), {});
  }

  prepareCarParameter(carParameterKey, carParameterValue) {
    const isKeyUnknown = !carParameterKey in this.carInfoSchema;
    const isInvalidType = typeof carParameterValue !== this.carInfoSchema[carParameterKey];
    const isUnknownManufacturer = carParameterKey === 'manufacturer' && !this.manufacturersSet.has(carParameterValue);

    if (isKeyUnknown || isInvalidType || isUnknownManufacturer) {
      return null;
    }
    return {
      [carParameterKey]: carParameterValue,
    };
  }
}

module.exports = new CarService();
