import axios from 'axios';

const ADVISORY_RULES = {
  rain: (prob) => prob > 60 ? "Avoid irrigation and pesticide spraying today." : null,
  heat: (temp) => temp > 35 ? "Increase irrigation frequency for heat-sensitive crops." : null,
  wind: (speed) => speed > 15 ? "Do not spray pesticides due to drift risk." : null,
  humidity: (hum) => hum > 80 ? "Possible fungal infection; monitor crops." : null,
  spraying: (wind, rainNext6h) => (wind < 10 && !rainNext6h) ? "Good conditions for pesticide spraying." : null
};

export const fetchWeatherData = async (location) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const baseUrl = 'https://api.openweathermap.org/data/2.5';

  try {
    // 1. Fetch Current Weather
    const currentRes = await axios.get(`${baseUrl}/weather?q=${location}&units=metric&appid=${apiKey}`);
    // 2. Fetch Forecast
    const forecastRes = await axios.get(`${baseUrl}/forecast?q=${location}&units=metric&appid=${apiKey}`);

    const current = currentRes.data;
    const forecast = forecastRes.data.list;

    // Advisory Generation
    const advisories = [];
    const rainProb = (forecast[0].pop || 0) * 100;
    const windKmh = current.wind.speed * 3.6;
    const rainNext6h = forecast.slice(0, 2).some(f => f.pop > 0.1);

    const rules = [
      ADVISORY_RULES.rain(rainProb),
      ADVISORY_RULES.heat(current.main.temp),
      ADVISORY_RULES.wind(windKmh),
      ADVISORY_RULES.humidity(current.main.humidity),
      ADVISORY_RULES.spraying(windKmh, rainNext6h)
    ];
    rules.forEach(rule => rule && advisories.push(rule));

    return {
      location: current.name,
      country: current.sys.country,
      temp: current.main.temp,
      humidity: current.main.humidity,
      wind: windKmh.toFixed(1),
      rainProb: rainProb.toFixed(0),
      advisories,
      forecast: forecast.slice(0, 8).map(f => ({
        time: f.dt_txt,
        temp: f.main.temp,
        rain: (f.pop * 100).toFixed(0)
      }))
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Weather fetch failed');
  }
};