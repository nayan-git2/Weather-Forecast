import React, { useEffect, useRef } from 'react';
import {
  MapPin,
  Star,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  CloudRain,
  Clock,
  Layers,
  Wind,
  Maximize2,
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import {
  getWeatherInfo,
  convertTemp,
  convertWindSpeed,
  formatLocalTime,
  formatLocalDate,
} from '../services/weatherUtils';
import { getCartoTileUrl, CARTO_ATTRIBUTION } from '../config/mapConfig';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function CurrentWeatherCard({
  city,
  weather,
  unit = 'C',
  windUnit = 'kmh',
  isFavorite = false,
  onToggleFavorite,
  onRefresh,
  isRefreshing = false,
  onOpenRadarModal,
  isDark = false,
}) {
  const miniMapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const current = weather?.current;
  const daily = weather?.daily || {};
  const weatherInfo = getWeatherInfo(current?.weather_code, current?.is_day);

  const temp = convertTemp(current?.temperature_2m, unit);
  const feelsLike = convertTemp(current?.apparent_temperature, unit);
  const maxTemp = daily.temperature_2m_max ? convertTemp(daily.temperature_2m_max[0], unit) : null;
  const minTemp = daily.temperature_2m_min ? convertTemp(daily.temperature_2m_min[0], unit) : null;
  const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
  const windGusts = current?.wind_gusts_10m ? convertWindSpeed(current.wind_gusts_10m, windUnit) : null;

  const localTime = formatLocalTime(current?.time, weather?.timezone);
  const localDate = formatLocalDate(current?.time, weather?.timezone);

  // Initialize mini radar map
  useEffect(() => {
    if (!miniMapRef.current || !city?.lat || !city?.lon) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(miniMapRef.current, {
        center: [city.lat, city.lon],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      });

      L.tileLayer(getCartoTileUrl(isDark), {
        attribution: CARTO_ATTRIBUTION,
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map);

      fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then((r) => r.json())
        .then((data) => {
          if (data?.radar?.past?.length > 0) {
            const latest = data.radar.past[data.radar.past.length - 1];
            L.tileLayer(
              `https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`,
              {
                opacity: 0.65,
                maxNativeZoom: 7,
                maxZoom: 18,
                zIndex: 100,
              }
            ).addTo(map);
          }
        })
        .catch(() => {});

      const pin = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #0284c7; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px rgba(2,132,199,0.9);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([city.lat, city.lon], { icon: pin }).addTo(map);

      mapInstanceRef.current = map;
    } catch {
      // Fallback
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city?.lat, city?.lon, isDark]);

  if (!weather || !weather.current) return null;

  // High-contrast text colors
  const textHeading = isDark ? 'text-white' : 'text-slate-950';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-700';

  return (
    <div className="w-full max-w-7xl mx-auto my-6 grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
      {/* 1. Primary Weather Hero Card (8 Cols) */}
      <div className={`xl:col-span-8 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between transition-all ${
        isDark ? 'bento-card-dark' : 'bento-card-light'
      }`}>
        {/* Ambient background blur */}
        <div className={`pointer-events-none absolute -right-16 -top-16 w-80 h-80 rounded-full blur-[90px] ${
          isDark ? 'bg-sky-500/10' : 'bg-sky-300/30'
        }`} />

        {/* Top Meta Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-space text-2xl sm:text-4xl font-extrabold tracking-tight ${textHeading}`}>
                  {city.name}
                </h1>
                {city.countryCode && (
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold tracking-wider ${
                    isDark ? 'bg-slate-800 text-sky-400 border border-slate-700' : 'bg-sky-100 text-sky-950 border border-sky-300'
                  }`}>
                    {city.countryCode}
                  </span>
                )}
              </div>
              <p className={`text-xs sm:text-sm font-bold mt-0.5 ${textMuted}`}>
                {[city.admin1, city.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Save to Favorites Button */}
            <button
              onClick={() => onToggleFavorite(city)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer btn-interactive ${
                isFavorite
                  ? 'bg-amber-100 text-amber-950 border border-amber-400 shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300 shadow-2xs'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`} />
              <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-xl border transition-all cursor-pointer btn-interactive ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200 shadow-2xs'
              }`}
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center: Bold High-Contrast Temperature & Condition Visual */}
        <div className="relative z-10 my-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-baseline">
              <span className={`font-space text-7xl sm:text-9xl font-black tracking-tight leading-none ${textHeading}`}>
                {temp}
              </span>
              <span className="font-space text-4xl sm:text-6xl font-black text-sky-600 dark:text-sky-400 ml-1">
                °{unit}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`text-xl sm:text-2xl font-black font-space ${textHeading}`}>
                  {weatherInfo.label}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-black font-mono tracking-wide ${
                  isDark ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-sky-100 text-sky-950 border border-sky-300'
                }`}>
                  Feels like {feelsLike}°{unit}
                </span>
              </div>

              {maxTemp !== null && minTemp !== null && (
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-extrabold pt-1">
                  <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-lg border border-rose-300 dark:border-rose-900">
                    <ArrowUp className="w-4 h-4 stroke-[3]" /> High: {maxTemp}°{unit}
                  </span>
                  <span className="flex items-center gap-1 text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-0.5 rounded-lg border border-sky-300 dark:border-sky-900">
                    <ArrowDown className="w-4 h-4 stroke-[3]" /> Low: {minTemp}°{unit}
                  </span>
                  {windGusts && (
                    <span className="flex items-center gap-1 text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-lg border border-teal-300 dark:border-teal-900">
                      <Wind className="w-4 h-4 text-teal-600" /> Peak Gusts: {windGusts} {windUnit}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Condition Icon */}
          <div className={`p-6 sm:p-7 rounded-3xl border flex items-center justify-center shrink-0 shadow-sm self-start md:self-center ${
            isDark
              ? 'bg-slate-800/80 border-slate-700'
              : 'bg-slate-50 border-slate-200 shadow-md'
          }`}>
            <WeatherIcon
              name={weatherInfo.icon}
              className="w-20 h-20 sm:w-24 sm:h-24"
              isDay={current.is_day}
            />
          </div>
        </div>

        {/* Bottom Metadata Footer */}
        <div className={`relative z-10 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
          isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Local Time: <strong className={`font-black ${textHeading}`}>{localTime}</strong> ({localDate})</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CloudRain className="w-4 h-4 text-sky-600" /> Rain Probability: <strong className={`font-black ${textHeading}`}>{rainProb}%</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">● Live Meteorological Telemetry</span>
          </div>
        </div>
      </div>

      {/* 2. Embedded Live Doppler Radar Card (4 Cols) */}
      <div className={`xl:col-span-4 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between transition-all ${
        isDark ? 'bento-card-dark' : 'bento-card-light'
      }`}>
        {/* Radar Card Header */}
        <div className="flex items-center justify-between mb-3 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-space font-extrabold text-base ${textHeading}`}>
                Live Doppler Radar
              </h3>
              <span className={`text-xs font-semibold block ${textMuted}`}>
                Precipitation & Cloud Tracking
              </span>
            </div>
          </div>

          <button
            onClick={onOpenRadarModal}
            className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer btn-interactive ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900 shadow-2xs'
            }`}
            title="Open Interactive Radar"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Expand</span>
          </button>
        </div>

        {/* Map Preview Window */}
        <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shadow-inner">
          <div ref={miniMapRef} className="w-full h-full z-0" />

          {/* Overlay Pill */}
          <div className="absolute bottom-2.5 left-2.5 z-10 px-3 py-1 rounded-full bg-slate-950/90 text-[11px] font-mono font-bold text-white shadow-lg flex items-center gap-2 border border-white/20">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>RADAR LIVE • {city.name}</span>
          </div>
        </div>

        {/* Quick Map Legend */}
        <div className={`mt-3.5 pt-3 border-t flex items-center justify-between text-xs font-extrabold ${
          isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-900'
        }`}>
          <span>Precipitation Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-semibold">Light</span>
            <div className="w-20 h-2 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 shadow-2xs" />
            <span className="text-[10px] text-slate-500 font-semibold">Heavy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
