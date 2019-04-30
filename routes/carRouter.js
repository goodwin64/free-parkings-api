const express = require('express');
const router = express.Router();

const CarService = require('../helpers/CarService');


router.get('/manufacturers', function (req, res) {
  res.status(200);
  res.json(CarService.getManufacturersList());
});


module.exports = router;
