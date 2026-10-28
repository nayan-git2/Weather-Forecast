/**
 * Weather & Geocoding API client using Open-Meteo (No API keys required, free tier with real-time data).
 */

const CACHE = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export const DEFAULT_CITIES = [
  { id: 2643743, name: 'London', admin1: 'England', country: 'United Kingdom', countryCode: 'GB', lat: 51.50853, lon: -0.12574, timezone: 'Europe/London' },
  { id: 5128581, name: 'New York', admin1: 'New York', country: 'United States', countryCode: 'US', lat: 40.71427, lon: -74.00597, timezone: 'America/New_York' },
  { id: 1850147, name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6895, lon: 139.69171, timezone: 'Asia/Tokyo' },
  { id: 2988507, name: 'Paris', admin1: 'Île-de-France', country: 'France', countryCode: 'FR', lat: 48.85341, lon: 2.3488, timezone: 'Europe/Paris' },
  { id: 2147714, name: 'Sydney', admin1: 'New South Wales', country: 'Australia', countryCode: 'AU', lat: -33.86785, lon: 151.20732, timezone: 'Australia/Sydney' },
  { id: 292223, name: 'Dubai', admin1: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.07725, lon: 55.30927, timezone: 'Asia/Dubai' },
  { id: 1275339, name: 'Mumbai', admin1: 'Maharashtra', country: 'India', countryCode: 'IN', lat: 19.07283, lon: 72.88261, timezone: 'Asia/Kolkata' },
  { id: 1880252, name: 'Singapore', admin1: 'Central Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.28967, lon: 103.85007, timezone: 'Asia/Singapore' },
];

/**
 * Search cities with autocomplete from Open-Meteo Geocoding
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to search cities');
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item) => ({
      id: item.id,
      name: item.name,
      admin1: item.admin1 || '',
      country: item.country || '',
      countryCode: item.country_code || '',
      lat: item.latitude,
      lon: item.longitude,
      timezone: item.timezone || 'auto',
      population: item.population,
    }));
  } catch (err) {
    console.error('searchCities error:', err);
    return [];
  }
}

/**
 * Reverse geocode latitude and longitude to a human-readable city name
 */
export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Reverse geocoding error');
    const data = await res.json();

    const cityName = data.city || data.locality || data.principalSubdivision || 'Current Location';
    return {
      id: `custom-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      name: cityName,
      admin1: data.principalSubdivision || '',
      country: data.countryName || '',
      countryCode: data.countryCode || '',
      lat,
      lon,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
    };
  } catch {
    return {
      id: `loc-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      name: 'Current Location',
      admin1: '',
      country: '',
      countryCode: '',
      lat,
      lon,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
    };
  }
}

/**
 * Fetch detailed weather forecast (current, hourly, daily)
 */
export async function fetchWeatherData(lat, lon, timezone = 'auto') {
  const cacheKey = `weather_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: timezone || 'auto',
    forecast_days: '7',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather data request failed with status: ${res.status}`);
  }

  const data = await res.json();
  CACHE.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

/**
 * Fetch air quality index and pollutant concentrations
 */
export async function fetchAirQuality(lat, lon) {
  const cacheKey = `aqi_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'us_aqi',
        'european_aqi',
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
      ].join(','),
    });

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    CACHE.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.warn('Air quality data unavailable:', err);
    return null;
  }
}
