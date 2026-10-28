import React, { useState } from 'react';
import {
  CalendarDays,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import {
  getWeatherInfo,
  convertTemp,
  convertWindSpeed,
} from '../services/weatherUtils';

export default function DailyForecast({
  weather,
  unit = 'C',
  windUnit = 'kmh',
  isDark = false,
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!weather || !weather.daily || !weather.daily.time) return null;

  const daily = weather.daily;

  const textHeading = isDark ? 'text-white' : 'text-slate-950';
  const textLabel = isDark ? 'text-slate-300' : 'text-slate-800';

  const allMins = daily.temperature_2m_min.map((t) => convertTemp(t, unit));
  const allMaxs = daily.temperature_2m_max.map((t) => convertTemp(t, unit));
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const totalRange = Math.max(weekMax - weekMin, 1);

  const getDayName = (dateStr, idx) => {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
    } catch {
      return `Day ${idx + 1}`;
    }
  };

  const getShortDate = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
    } catch {
      return dateStr;
    }
  };

  const cardClass = isDark ? 'bento-card-dark' : 'bento-card-light';

  return (
    <div className={`w-full max-w-7xl mx-auto my-6 rounded-3xl p-6 sm:p-8 ${cardClass}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs">
            <CalendarDays className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className={`font-space text-xl sm:text-2xl font-black tracking-tight ${textHeading}`}>
              7-Day Extended Outlook
            </h3>
            <p className={`text-xs sm:text-sm font-bold mt-0.5 ${textLabel}`}>
              Multi-day meteorological predictions and temperature spreads
            </p>
          </div>
        </div>
        <span className={`text-xs font-black px-3 py-1 rounded-full border ${
          isDark ? 'bg-sky-950 text-sky-300 border-sky-800' : 'bg-sky-100 text-sky-950 border-sky-300'
        }`}>
          Click a day for details
        </span>
      </div>

      <div className="space-y-3">
        {daily.time.map((dateStr, idx) => {
          const info = getWeatherInfo(daily.weather_code[idx], 1);
          const minT = convertTemp(daily.temperature_2m_min[idx], unit);
          const maxT = convertTemp(daily.temperature_2m_max[idx], unit);
          const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0;
          const precipSum = daily.precipitation_sum ? daily.precipitation_sum[idx] : 0;
          const maxWind = daily.wind_speed_10m_max ? convertWindSpeed(daily.wind_speed_10m_max[idx], windUnit) : null;
          const maxUv = daily.uv_index_max ? Math.round(daily.uv_index_max[idx]) : 0;
          const isExpanded = expandedIndex === idx;

          const leftPercent = ((minT - weekMin) / totalRange) * 100;
          const widthPercent = Math.max(((maxT - minT) / totalRange) * 100, 6);

          return (
            <div
              key={dateStr}
              className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? isDark
                    ? 'bg-sky-500/15 border-sky-400 shadow-md'
                    : 'bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-300'
                  : isDark
                  ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                  : 'bg-slate-50 border-slate-300 hover:bg-white hover:border-slate-400 shadow-2xs'
              }`}
            >
              {/* Summary Row */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                {/* Day & Date */}
                <div className="w-24 sm:w-36 shrink-0">
                  <p className={`font-space text-base sm:text-lg font-black ${
                    idx === 0
                      ? 'text-sky-700 dark:text-sky-400'
                      : textHeading
                  }`}>
                    {getDayName(dateStr, idx)}
                  </p>
                  <p className={`text-xs font-bold font-mono ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    {getShortDate(dateStr)}
                  </p>
                </div>

                {/* Weather Condition & Icon */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0">
                    <WeatherIcon name={info.icon} className="w-7 h-7" isDay={1} />
                  </div>
                  <span className={`text-sm font-black truncate hidden md:inline ${textHeading}`}>
                    {info.label}
                  </span>
                </div>

                {/* Rain Probability */}
                <div className="w-18 sm:w-24 text-center shrink-0">
                  {rainProb > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-950 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-400 dark:border-blue-700 text-xs font-black">
                      <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 stroke-[2.5]" />
                      <span>{rainProb}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-extrabold">0%</span>
                  )}
                </div>

                {/* Min / Max Temperature Bar Visualizer */}
                <div className="w-32 sm:w-52 shrink-0 flex items-center gap-2.5">
                  <span className={`font-space text-sm font-black w-8 text-right ${isDark ? 'text-sky-300' : 'text-sky-900'}`}>
                    {minT}°
                  </span>

                  <div className="flex-1 h-2.5 bg-slate-200 dark:bg-white/15 rounded-full relative overflow-hidden hidden sm:block shadow-inner">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-sky-500 via-amber-400 to-rose-500"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className={`font-space text-sm font-black w-8 ${isDark ? 'text-rose-400' : 'text-rose-900'}`}>
                    {maxT}°
                  </span>
                </div>

                {/* Chevron */}
                <div className="shrink-0 text-slate-600 dark:text-slate-400 pl-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-sky-600 stroke-[2.5]" /> : <ChevronDown className="w-5 h-5 stroke-[2.5]" />}
                </div>
              </button>

              {/* Detailed Breakdown Drawer */}
              {isExpanded && (
                <div className={`px-5 pb-5 pt-3 border-t-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
                  isDark
                    ? 'border-slate-700 bg-slate-900/80 text-slate-200'
                    : 'border-slate-300 bg-white text-slate-900'
                }`}>
                  <div className={`flex items-center gap-2.5 p-3 rounded-xl border-2 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}>
                    <Droplets className="w-5 h-5 text-sky-600 stroke-[2.5]" />
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase font-black">Precipitation</p>
                      <p className={`font-black text-sm ${textHeading}`}>{precipSum} mm sum</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2.5 p-3 rounded-xl border-2 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}>
                    <Wind className="w-5 h-5 text-teal-600 stroke-[2.5]" />
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase font-black">Max Wind</p>
                      <p className={`font-black text-sm ${textHeading}`}>{maxWind} {windUnit}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2.5 p-3 rounded-xl border-2 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}>
                    <Sun className="w-5 h-5 text-amber-600 stroke-[2.5]" />
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase font-black">Max UV Index</p>
                      <p className={`font-black text-sm ${textHeading}`}>{maxUv} (Peak)</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2.5 p-3 rounded-xl border-2 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}>
                    <Sunrise className="w-5 h-5 text-rose-600 stroke-[2.5]" />
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase font-black">Condition</p>
                      <p className={`font-black text-sm truncate ${textHeading}`}>{info.label}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
