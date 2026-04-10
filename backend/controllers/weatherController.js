const axios = require('axios');

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// GET /api/weather?city=London
const getWeather = async (req, res, next) => {
  try {
    const { city = 'London', units = 'metric' } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey === 'your_openweathermap_api_key') {
      // Return mock data if no API key
      return res.json({
        success: true,
        data: getMockWeather(city),
        isMock: true,
        message: 'Using mock data. Set WEATHER_API_KEY in .env for real data.',
      });
    }

    const response = await axios.get(`${BASE_URL}/weather`, {
      params: { q: city, appid: apiKey, units },
      timeout: 5000,
    });

    const data = response.data;
    res.json({
      success: true,
      data: {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        visibility: data.visibility,
        units,
      },
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }
    if (error.response?.status === 401) {
      // Fallback to mock on auth error
      return res.json({ success: true, data: getMockWeather(req.query.city || 'London'), isMock: true });
    }
    next(error);
  }
};

// GET /api/weather/forecast?city=London
const getForecast = async (req, res, next) => {
  try {
    const { city = 'London', units = 'metric' } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey === 'your_openweathermap_api_key') {
      return res.json({ success: true, data: getMockForecast(city), isMock: true });
    }

    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: { q: city, appid: apiKey, units, cnt: 5 },
      timeout: 5000,
    });

    const forecast = response.data.list.map((item) => ({
      date: item.dt_txt,
      temperature: item.main.temp,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    }));

    res.json({ success: true, data: { city, forecast } });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }
    next(error);
  }
};

function getMockWeather(city) {
  return {
    city: city || 'Srinagar',
    country: 'IN',
    temperature: 18,
    feelsLike: 16,
    humidity: 65,
    description: 'partly cloudy',
    icon: '02d',
    windSpeed: 3.2,
    visibility: 10000,
    units: 'metric',
  };
}

function getMockForecast(city) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return {
    city,
    forecast: days.map((d, i) => ({
      date: d,
      temperature: 15 + i,
      description: 'clear sky',
      icon: '01d',
    })),
  };
}

module.exports = { getWeather, getForecast };
