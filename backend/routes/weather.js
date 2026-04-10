const express = require('express');
const router = express.Router();
const { getWeather, getForecast } = require('../controllers/weatherController');

router.get('/', getWeather);
router.get('/forecast', getForecast);

module.exports = router;
