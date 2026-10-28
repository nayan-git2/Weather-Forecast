import React, { useState, useMemo } from 'react';
import {
  Clock,
  Droplets,
  Wind,
  LineChart,
  LayoutGrid,
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import {
  getWeatherInfo,
  convertTemp,
  convertWindSpeed,
  formatLocalTime,
} from '../services/weatherUtils';

export default function HourlyForecast({
  weather,
  unit = 'C',
  windUnit = 'kmh',
  isDark = false,
}) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'chart'

  const hourly = weather?.hourly;
  const weatherTime = weather?.current?.time;
  const currentTime = useMemo(() => {
    return weatherTime ? new Date(weatherTime).getTime() : 0;
  }, [weatherTime]);

  const textHeading = isDark ? 'text-white' : 'text-slate-950';
  const textLabel = isDark ? 'text-slate-300' : 'text-slate-800';

  // Filter next 24 hours
  const next24Hours = useMemo(() => {
    if (!hourly || !hourly.time) return [];
    const list = [];
    for (let i = 0; i < hourly.time.length; i++) {
      const itemTime = new Date(hourly.time[i]).getTime();
      if (itemTime >= currentTime - 3600000 && list.length < 24) {
        list.push({
          timeStr: hourly.time[i],
          temp: hourly.temperature_2m[i],
          precipProb: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
          precip: hourly.precipitation ? hourly.precipitation[i] : 0,
          weatherCode: hourly.weather_code[i],
          windSpeed: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0,
          humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : 0,
          isDay: hourly.is_day ? hourly.is_day[i] : 1,
        });
      }
    }
    return list;
  }, [hourly, currentTime]);

  // Compute SVG chart coordinates
  const chartData = useMemo(() => {
    if (!next24Hours || next24Hours.length === 0) return null;
    const temps = next24Hours.map((h) => convertTemp(h.temp, unit));
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = Math.max(maxTemp - minTemp, 4);

    const width = 800;
    const height = 180;
    const paddingX = 40;
    const paddingY = 30;

    const points = next24Hours.map((item, idx) => {
      const x = paddingX + (idx / (next24Hours.length - 1)) * (width - 2 * paddingX);
      const tempVal = convertTemp(item.temp, unit);
      const y = height - paddingY - ((tempVal - minTemp) / range) * (height - 2 * paddingY);
      return { x, y, tempVal, item };
    });

    const pathD = points.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { points, pathD, areaD, width, height, minTemp, maxTemp };
  }, [next24Hours, unit]);

  if (!weather || !weather.hourly || !weather.hourly.time || next24Hours.length === 0) {
    return null;
  }

  const cardClass = isDark ? 'bento-card-dark' : 'bento-card-light';

  return (
    <div className={`w-full max-w-7xl mx-auto my-6 rounded-3xl p-6 sm:p-8 ${cardClass}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className={`font-space text-xl sm:text-2xl font-black tracking-tight ${textHeading}`}>
              Hourly Atmospheric Timeline
            </h3>
            <p className={`text-xs sm:text-sm font-bold ${textLabel}`}>
              24-hour continuous meteorological forecast & rain probabilities
            </p>
          </div>
        </div>

        {/* View switcher */}
        <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300 shadow-2xs'
        }`}>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'cards'
                ? isDark
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-sky-950 shadow-sm border border-slate-200'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'chart'
                ? isDark
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-sky-950 shadow-sm border border-slate-200'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Trend Curve</span>
          </button>
        </div>
      </div>

      {/* 1. Horizontal Scrollable Cards */}
      {viewMode === 'cards' && (
        <div className="relative">
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar">
            {next24Hours.map((hour, idx) => {
              const formattedTime = idx === 0 ? 'Now' : formatLocalTime(hour.timeStr, weather.timezone);
              const info = getWeatherInfo(hour.weatherCode, hour.isDay);
              const displayTemp = convertTemp(hour.temp, unit);
              const speed = convertWindSpeed(hour.windSpeed, windUnit);

              return (
                <div
                  key={hour.timeStr}
                  className={`shrink-0 flex flex-col items-center justify-between w-26 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    idx === 0
                      ? isDark
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                        : 'bg-sky-50 border-sky-500 text-slate-950 shadow-md ring-2 ring-sky-300'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-300 hover:bg-white hover:border-slate-400 text-slate-950 shadow-2xs'
                  }`}
                >
                  <span className={`text-xs font-black ${idx === 0 ? 'text-sky-700 dark:text-sky-300' : textHeading}`}>
                    {formattedTime}
                  </span>

                  <div className="my-2.5">
                    <WeatherIcon name={info.icon} className="w-8 h-8" isDay={hour.isDay} />
                  </div>

                  <span className={`font-space text-xl font-black mb-2 ${textHeading}`}>
                    {displayTemp}°{unit}
                  </span>

                  <div
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                      hour.precipProb > 30
                        ? 'bg-blue-100 text-blue-950 border border-blue-400 dark:bg-blue-900/60 dark:text-blue-200'
                        : isDark ? 'text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>{hour.precipProb}%</span>
                  </div>

                  <span className={`text-[11px] font-bold mt-2 flex items-center gap-1 font-mono ${textLabel}`}>
                    <Wind className="w-3 h-3 text-slate-500" />
                    {speed}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Interactive SVG Trend Chart */}
      {viewMode === 'chart' && chartData && (
        <div className="w-full overflow-x-auto py-2">
          <div className="min-w-[680px] relative">
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-48 overflow-visible"
            >
              <defs>
                <linearGradient id="tempGradientAura" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={isDark ? "0.45" : "0.35"} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path d={chartData.areaD} fill="url(#tempGradientAura)" />

              <path
                d={chartData.pathD}
                fill="none"
                stroke="#0284c7"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {chartData.points.map((pt, i) => {
                const hourLabel = i === 0 ? 'Now' : formatLocalTime(pt.item.timeStr, weather.timezone);
                const showDetails = i % 2 === 0 || i === chartData.points.length - 1;

                return (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      className="fill-sky-600 stroke-white dark:stroke-slate-900 stroke-2 hover:r-6 cursor-pointer transition-all"
                    />

                    {showDetails && (
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        className="text-[13px] font-black font-space"
                        fill={isDark ? '#ffffff' : '#020617'}
                      >
                        {pt.tempVal}°
                      </text>
                    )}

                    {pt.item.precipProb > 0 && (
                      <rect
                        x={pt.x - 4}
                        y={chartData.height - 18 - (pt.item.precipProb * 0.25)}
                        width="8"
                        height={pt.item.precipProb * 0.25}
                        rx="2"
                        className="fill-sky-600/70"
                      />
                    )}

                    {showDetails && (
                      <text
                        x={pt.x}
                        y={chartData.height - 2}
                        textAnchor="middle"
                        className="text-[11px] font-black font-mono"
                        fill={isDark ? '#cbd5e1' : '#0f172a'}
                      >
                        {hourLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            <div className={`flex items-center justify-center gap-6 mt-4 text-xs font-black ${textHeading}`}>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-sky-600 rounded-full" /> Continuous Temperature Curve
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-sky-600/70 rounded-xs" /> Rain Volume Probability Bars
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
