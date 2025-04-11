import { DateTime } from "luxon";

const API_KEY = "c6ad3be1db5c4cf5b4010332251104"; // replace this with your key
const BASE_URL = "https://api.weatherapi.com/v1";

// Helper: convert to local time
const formatToLocalTime = (
  timeString,
  zone,
  format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromISO(timeString, { zone }).toFormat(format);

// Convert icon code to full URL
const iconUrlFromCode = (iconPath) =>
  `https:${iconPath}`;

// Fetch data from WeatherAPI
const getWeatherData = (endpoint, params) => {
  const url = new URL(`${BASE_URL}/${endpoint}.json`);
  url.search = new URLSearchParams({ key: API_KEY, ...params });

  return fetch(url).then((res) => res.json());
};

// Format current weather data
const formatCurrentWeather = (data) => {
  const {
    location: { name, country, tz_id, localtime },
    current: {
      temp_c,
      feelslike_c,
      humidity,
      wind_kph,
      condition: { text: details, icon },
      last_updated,
    },
  } = data;

  return {
    name,
    country,
    timezone: tz_id,
    localtime,
    temp: temp_c,
    feels_like: feelslike_c,
    humidity,
    speed: wind_kph,
    details,
    icon,
    last_updated,
  };
};

// Format forecast data (next 5 days)
const formatForecastWeather = (data) => {
  const {
    forecast: { forecastday },
    location: { tz_id },
  } = data;

  const daily = forecastday.slice(1, 6).map((day) => ({
    title: formatToLocalTime(day.date, tz_id, "ccc"),
    temp: day.day.avgtemp_c,
    icon: day.day.condition.icon,
  }));

  const hourly = forecastday[0].hour
    .filter((_, idx) => idx % 3 === 0 && idx <= 15)
    .map((hour) => ({
      title: formatToLocalTime(hour.time, tz_id, "hh:mm a"),
      temp: hour.temp_c,
      icon: hour.condition.icon,
    }));

  return { timezone: tz_id, daily, hourly };
};

// Combined weather fetcher
const getFormattedWeatherData = async (searchParams) => {
  const currentData = await getWeatherData("current", searchParams);
  const formattedCurrent = formatCurrentWeather(currentData);

  const forecastData = await getWeatherData("forecast", {
    ...searchParams,
    days: 6,
  });

  const formattedForecast = formatForecastWeather(forecastData);

  return { ...formattedCurrent, ...formattedForecast };
};

export default getFormattedWeatherData;
export { formatToLocalTime, iconUrlFromCode };
