import React from 'react';
import {
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Navigation,
} from 'lucide-react';
import {
  convertWindSpeed,
  getWindDirection,
  convertPressure,
  getUVDescription,
  formatLocalTime,
  calculateSunProgress,
} from '../services/weatherUtils';

export default function WeatherMetricsGrid({
  weather,
  windUnit = 'kmh',
  pressureUnit = 'hPa',
  isDark = false,
}) {
  if (!weather || !weather.current) return null;

  const current = weather.current;
  const daily = weather.daily || {};

  // High-contrast text colors
  const textHeading = isDark ? 'text-white' : 'text-slate-950';
  const textBody = isDark ? 'text-slate-200' : 'text-slate-900';
  const textLabel = isDark ? 'text-slate-300' : 'text-slate-800';

  // Humidity
  const humidity = current.relative_humidity_2m;
  const getHumidityStatus = (h) => {
    if (h < 30) return { label: 'Dry air', color: isDark ? 'text-amber-300 font-bold' : 'text-amber-900 font-black' };
    if (h <= 60) return { label: 'Comfortable', color: isDark ? 'text-emerald-300 font-bold' : 'text-emerald-900 font-black' };
    if (h <= 80) return { label: 'Humid', color: isDark ? 'text-sky-300 font-bold' : 'text-sky-900 font-black' };
    return { label: 'Very humid', color: isDark ? 'text-indigo-300 font-bold' : 'text-indigo-900 font-black' };
  };
  const humStatus = getHumidityStatus(humidity);

  // Wind
  const windSpeed = convertWindSpeed(current.wind_speed_10m, windUnit);
  const windGusts = convertWindSpeed(current.wind_gusts_10m, windUnit);
  const windDirCardinal = getWindDirection(current.wind_direction_10m);

  // Rain / Precipitation
  const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
  const precipSum = daily.precipitation_sum ? daily.precipitation_sum[0] : current.precipitation;

  // UV Index
  const uvValue = current.uv_index !== undefined ? current.uv_index : (daily.uv_index_max ? daily.uv_index_max[0] : 0);
  const uvInfo = getUVDescription(uvValue);

  // Pressure
  const pressureVal = convertPressure(current.surface_pressure || current.pressure_msl, pressureUnit);

  // Sunrise / Sunset
  const sunriseIso = daily.sunrise ? daily.sunrise[0] : null;
  const sunsetIso = daily.sunset ? daily.sunset[0] : null;
  const sunriseTime = sunriseIso ? formatLocalTime(sunriseIso, weather.timezone) : '--:--';
  const sunsetTime = sunsetIso ? formatLocalTime(sunsetIso, weather.timezone) : '--:--';
  const sunProgress = calculateSunProgress(sunriseIso, sunsetIso, current.time);

  const cardClass = isDark ? 'bento-card-dark' : 'bento-card-light';

  return (
    <div className="w-full max-w-7xl mx-auto my-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h3 className={`font-space text-xl sm:text-2xl font-black tracking-tight ${textHeading}`}>
            Atmospheric & Sensor Telemetry
          </h3>
          <p className={`text-xs sm:text-sm font-bold mt-0.5 ${textLabel}`}>
            Real-time meteorological readings and precision sensors
          </p>
        </div>
        <span className={`text-xs font-mono font-black px-3 py-1 rounded-md border ${
          isDark ? 'bg-sky-950 text-sky-300 border-sky-800' : 'bg-sky-100 text-sky-950 border-sky-300'
        }`}>
          WMO Validated
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Humidity */}
        <div className={`p-5 rounded-3xl ${cardClass} bento-card-hover flex flex-col justify-between`}>
          <div className={`flex items-center justify-between mb-2 font-black ${textLabel}`}>
            <span className="text-xs uppercase tracking-wider">Humidity</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <Droplets className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className={`font-space text-3xl sm:text-4xl font-black mb-1 ${textHeading}`}>
              {humidity}%
            </div>
            <div className={`text-xs sm:text-sm flex items-center justify-between font-bold ${textBody}`}>
              <span>Comfort Level:</span>
              <span className={humStatus.color}>{humStatus.label}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, humidity))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Wind Velocity & Direction */}
        <div className={`p-5 rounded-3xl ${cardClass} bento-card-hover flex flex-col justify-between`}>
          <div className={`flex items-center justify-between mb-2 font-black ${textLabel}`}>
            <span className="text-xs uppercase tracking-wider">Wind Velocity</span>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <Wind className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className={`font-space text-3xl sm:text-4xl font-black ${textHeading}`}>
                {windSpeed}
              </span>
              <span className="text-xs sm:text-sm font-mono text-teal-600 dark:text-teal-400 font-black">
                {windUnit === 'kmh' ? 'km/h' : windUnit}
              </span>
            </div>
            <div className={`text-xs sm:text-sm flex items-center justify-between font-bold mt-1 ${textBody}`}>
              <span className="flex items-center gap-1">
                <Navigation
                  className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 transition-transform duration-500"
                  style={{ transform: `rotate(${current.wind_direction_10m || 0}deg)` }}
                />
                Heading:
              </span>
              <span className={`font-black ${textHeading}`}>
                {windDirCardinal} ({current.wind_direction_10m}°)
              </span>
            </div>
            {windGusts && (
              <p className="text-xs text-slate-700 dark:text-slate-300 font-extrabold mt-1.5 truncate">
                Peak Gusts: {windGusts} {windUnit}
              </p>
            )}
          </div>
        </div>

        {/* 3. Chances of Rain */}
        <div className={`p-5 rounded-3xl ${cardClass} bento-card-hover flex flex-col justify-between`}>
          <div className={`flex items-center justify-between mb-2 font-black ${textLabel}`}>
            <span className="text-xs uppercase tracking-wider">Precipitation Chance</span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <CloudRain className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className={`font-space text-3xl sm:text-4xl font-black mb-1 ${textHeading}`}>
              {rainProb}%
            </div>
            <div className={`text-xs sm:text-sm flex items-center justify-between font-bold ${textBody}`}>
              <span>Expected Volume:</span>
              <span className="font-black text-blue-700 dark:text-blue-400">{precipSum} mm</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, rainProb))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Solar UV Index */}
        <div className={`p-5 rounded-3xl ${cardClass} bento-card-hover flex flex-col justify-between`}>
          <div className={`flex items-center justify-between mb-2 font-black ${textLabel}`}>
            <span className="text-xs uppercase tracking-wider">Solar UV Index</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sun className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2.5 mb-1">
              <span className={`font-space text-3xl sm:text-4xl font-black ${textHeading}`}>
                {Math.round(uvValue)}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-black border ${uvInfo.bg} ${uvInfo.color}`}>
                {uvInfo.level}
              </span>
            </div>
            <p className={`text-xs font-bold leading-snug mt-1 ${textLabel}`}>
              {uvValue >= 6 ? 'High solar radiation; UV protection advised.' : 'Safe conditions under direct sunlight.'}
            </p>
          </div>
        </div>

        {/* 5. Barometric Pressure */}
        <div className={`p-5 rounded-3xl ${cardClass} bento-card-hover flex flex-col justify-between`}>
          <div className={`flex items-center justify-between mb-2 font-black ${textLabel}`}>
            <span className="text-xs uppercase tracking-wider">Barometer</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Gauge className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className={`font-space text-3xl sm:text-4xl font-black ${textHeading}`}>
                {pressureVal}
              </span>
              <span className="text-xs sm:text-sm font-mono text-indigo-600 dark:text-indigo-400 font-black">{pressureUnit}</span>
            </div>
            <div className={`text-xs sm:text-sm flex items-center justify-between font-bold ${textBody}`}>
              <span>Trend Status:</span>
              <span className={`font-black ${textHeading}`}>
                {current.surface_pressure > 1013 ? 'High (Stable Sky)' : 'Low (Precip Risk)'}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Cloud Cover */}
        <div className={`p-5 rounded-3xl ${cardClass} bento-card-hover flex flex-col justify-between`}>
          <div className={`flex items-center justify-between mb-2 font-black ${textLabel}`}>
            <span className="text-xs uppercase tracking-wider">Cloud Cover</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Eye className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className={`font-space text-3xl sm:text-4xl font-black mb-1 ${textHeading}`}>
              {current.cloud_cover}%
            </div>
            <div className={`text-xs sm:text-sm flex items-center justify-between font-bold ${textBody}`}>
              <span>Visual Sky:</span>
              <span className="font-black text-purple-700 dark:text-purple-400">
                {current.cloud_cover < 20 ? 'Clear & Sunny' : current.cloud_cover < 70 ? 'Partly Cloudy' : 'Full Overcast'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${current.cloud_cover}%` }}
              />
            </div>
          </div>
        </div>

        {/* 7. Solar Arc (Sunrise & Sunset - Spans 2 Cols) */}
        <div className={`col-span-2 md:col-span-3 lg:col-span-2 p-5 rounded-3xl ${cardClass} bento-card-hover flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-black uppercase tracking-wider ${textLabel}`}>Daylight & Solar Tracker</span>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
              isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-amber-100 text-amber-950 border-amber-300'
            }`}>
              {sunProgress.isDay ? `${sunProgress.progress}% of daylight elapsed` : 'Night phase active'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 mt-2">
            {/* Sunrise */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-2xs">
                <Sunrise className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <p className={`text-xs uppercase font-extrabold ${textLabel}`}>Sunrise</p>
                <p className={`font-space font-black text-base sm:text-xl ${textHeading}`}>{sunriseTime}</p>
              </div>
            </div>

            {/* Visual Sun Arc Bar */}
            <div className="flex-1 px-4">
              <div className="relative w-full h-3 bg-slate-200 dark:bg-white/15 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-rose-500 transition-all duration-700 rounded-full"
                  style={{ width: `${sunProgress.progress}%` }}
                />
              </div>
            </div>

            {/* Sunset */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-2xs">
                <Sunset className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <p className={`text-xs uppercase font-extrabold ${textLabel}`}>Sunset</p>
                <p className={`font-space font-black text-base sm:text-xl ${textHeading}`}>{sunsetTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
