/**
 * Utilities for formatting, unit conversion, and WMO weather codes.
 */

export const WMO_CODES = {
  0: { label: 'Clear Sky', icon: 'Sun', type: 'clear' },
  1: { label: 'Mainly Clear', icon: 'Sun', type: 'clear' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun', type: 'cloudy' },
  3: { label: 'Overcast', icon: 'Cloud', type: 'cloudy' },
  45: { label: 'Foggy', icon: 'CloudFog', type: 'fog' },
  48: { label: 'Icy Fog', icon: 'CloudFog', type: 'fog' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle', type: 'rain' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', type: 'rain' },
  55: { label: 'Dense Drizzle', icon: 'CloudDrizzle', type: 'rain' },
  56: { label: 'Light Freezing Drizzle', icon: 'CloudSnow', type: 'snow' },
  57: { label: 'Dense Freezing Drizzle', icon: 'CloudSnow', type: 'snow' },
  61: { label: 'Slight Rain', icon: 'CloudRain', type: 'rain' },
  63: { label: 'Moderate Rain', icon: 'CloudRain', type: 'rain' },
  65: { label: 'Heavy Rain', icon: 'CloudRain', type: 'rain' },
  66: { label: 'Light Freezing Rain', icon: 'CloudSnow', type: 'snow' },
  67: { label: 'Heavy Freezing Rain', icon: 'CloudSnow', type: 'snow' },
  71: { label: 'Slight Snowfall', icon: 'Snowflake', type: 'snow' },
  73: { label: 'Moderate Snowfall', icon: 'Snowflake', type: 'snow' },
  75: { label: 'Heavy Snowfall', icon: 'Snowflake', type: 'snow' },
  77: { label: 'Snow Grains', icon: 'Snowflake', type: 'snow' },
  80: { label: 'Light Rain Showers', icon: 'CloudRain', type: 'rain' },
  81: { label: 'Moderate Rain Showers', icon: 'CloudRain', type: 'rain' },
  82: { label: 'Violent Rain Showers', icon: 'CloudRain', type: 'rain' },
  85: { label: 'Light Snow Showers', icon: 'Snowflake', type: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: 'Snowflake', type: 'snow' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', type: 'thunderstorm' },
  96: { label: 'Thunderstorm with Hail', icon: 'CloudLightning', type: 'thunderstorm' },
  99: { label: 'Severe Thunderstorm', icon: 'CloudLightning', type: 'thunderstorm' },
};

export function getWeatherInfo(code, isDay = 1) {
  const info = WMO_CODES[code] || { label: 'Unknown', icon: 'Cloud', type: 'cloudy' };
  
  if (!isDay && (code === 0 || code === 1)) {
    return {
      label: 'Clear Night',
      icon: 'Moon',
      type: 'clear-night',
    };
  }
  if (!isDay && code === 2) {
    return {
      label: 'Partly Cloudy Night',
      icon: 'CloudMoon',
      type: 'cloudy-night',
    };
  }
  return info;
}

// Temperature conversion
export function convertTemp(celsius, unit = 'C') {
  if (celsius === undefined || celsius === null) return '--';
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

// Wind speed conversion
export function convertWindSpeed(kmh, unit = 'kmh') {
  if (kmh === undefined || kmh === null) return '--';
  if (unit === 'mph') {
    return (kmh * 0.621371).toFixed(1);
  }
  if (unit === 'ms') {
    return (kmh / 3.6).toFixed(1);
  }
  return Math.round(kmh);
}

// Wind direction compass degrees to cardinal
export function getWindDirection(deg) {
  if (deg === undefined || deg === null) return 'N/A';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// Pressure conversion
export function convertPressure(hPa, unit = 'hPa') {
  if (hPa === undefined || hPa === null) return '--';
  if (unit === 'inHg') {
    return (hPa * 0.02953).toFixed(2);
  }
  return Math.round(hPa);
}

// UV Index category
export function getUVDescription(uv) {
  if (uv === undefined || uv === null) return { level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (uv <= 2) return { level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
  if (uv <= 7) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
  if (uv <= 10) return { level: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  return { level: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
}

// Air Quality Index category (US AQI)
export function getAQIDescription(aqi) {
  if (aqi === undefined || aqi === null) return { status: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/20 text-emerald-300' };
  if (aqi <= 50) return { status: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/20 text-emerald-300', advice: 'Air quality is satisfactory. Enjoy outdoor activities.' };
  if (aqi <= 100) return { status: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20 text-yellow-300', advice: 'Acceptable quality; sensitive individuals may experience minor irritation.' };
  if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: 'text-orange-400', bg: 'bg-orange-500/20 text-orange-300', advice: 'Sensitive people should limit prolonged outdoor exertion.' };
  if (aqi <= 200) return { status: 'Unhealthy', color: 'text-rose-400', bg: 'bg-rose-500/20 text-rose-300', advice: 'Everyone may begin to experience health effects; avoid strenuous outdoor exercise.' };
  if (aqi <= 300) return { status: 'Very Unhealthy', color: 'text-purple-400', bg: 'bg-purple-500/20 text-purple-300', advice: 'Health alert: serious risk. Keep windows closed and stay indoors.' };
  return { status: 'Hazardous', color: 'text-red-500', bg: 'bg-red-500/20 text-red-300', advice: 'Emergency warning: Entire population is likely affected. Stay indoors.' };
}

// Format time given ISO string and timezone
export function formatLocalTime(isoString, timezone) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// Format full local date
export function formatLocalDate(isoString, timezone) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || undefined,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }
}

// Calculate percentage of day passed (for sunrise / sunset progress bar)
export function calculateSunProgress(sunriseIso, sunsetIso, currentTimeIso) {
  if (!sunriseIso || !sunsetIso) return { progress: 0, isDay: true };
  const rise = new Date(sunriseIso).getTime();
  const set = new Date(sunsetIso).getTime();
  const current = currentTimeIso ? new Date(currentTimeIso).getTime() : Date.now();

  if (current <= rise) return { progress: 0, isDay: false };
  if (current >= set) return { progress: 100, isDay: false };

  const total = set - rise;
  const elapsed = current - rise;
  return {
    progress: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))),
    isDay: true,
  };
}
