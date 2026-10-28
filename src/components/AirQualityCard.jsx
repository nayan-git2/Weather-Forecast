import React from 'react';
import { Activity } from 'lucide-react';
import { getAQIDescription } from '../services/weatherUtils';

export default function AirQualityCard({ aqiData, isDark = false }) {
  if (!aqiData || !aqiData.current) return null;

  const current = aqiData.current;
  const usAqi = current.us_aqi !== undefined ? Math.round(current.us_aqi) : null;
  if (usAqi === null) return null;

  const aqiInfo = getAQIDescription(usAqi);

  const textHeading = isDark ? 'text-white' : 'text-slate-950';
  const textBody = isDark ? 'text-slate-200' : 'text-slate-900';
  const textLabel = isDark ? 'text-slate-300' : 'text-slate-800';

  const pollutants = [
    { label: 'PM2.5', value: current.pm2_5, unit: 'µg/m³', max: 50 },
    { label: 'PM10', value: current.pm10, unit: 'µg/m³', max: 100 },
    { label: 'Ozone (O₃)', value: current.ozone, unit: 'µg/m³', max: 180 },
    { label: 'NO₂', value: current.nitrogen_dioxide, unit: 'µg/m³', max: 100 },
    { label: 'SO₂', value: current.sulphur_dioxide, unit: 'µg/m³', max: 50 },
    { label: 'CO', value: current.carbon_monoxide, unit: 'µg/m³', max: 1000 },
  ];

  const cardClass = isDark ? 'bento-card-dark' : 'bento-card-light';

  return (
    <div className={`w-full max-w-7xl mx-auto my-6 rounded-3xl p-6 sm:p-8 ${cardClass}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className={`font-space text-xl sm:text-2xl font-black tracking-tight ${textHeading}`}>
              Air Quality & Environmental Index (AQI)
            </h3>
            <p className={`text-xs sm:text-sm font-bold mt-0.5 ${textLabel}`}>
              US EPA Ambient Air Quality Standards & Particulate Telemetry
            </p>
          </div>
        </div>
        <span className={`text-xs font-mono font-black px-3 py-1 rounded-full border ${
          isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-100 text-emerald-950 border-emerald-300'
        }`}>
          Live Sampling
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Score & Status */}
        <div className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center justify-center ${
          isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs font-black uppercase tracking-wider mb-1 ${textLabel}`}>
            US EPA AQI Index
          </span>
          <div className={`font-space text-6xl sm:text-7xl font-black tracking-tight my-1 ${textHeading}`}>
            {usAqi}
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black mt-1 shadow-2xs border ${aqiInfo.bg}`}>
            {aqiInfo.status}
          </span>
          <p className={`text-xs sm:text-sm font-bold mt-3 max-w-xs leading-relaxed ${textBody}`}>
            {aqiInfo.advice}
          </p>
        </div>

        {/* Right: Pollutant Breakdown */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {pollutants.map((p) => {
            const val = p.value !== undefined ? Math.round(p.value * 10) / 10 : '--';
            const percent = typeof p.value === 'number' ? Math.min(100, Math.max(5, (p.value / p.max) * 100)) : 0;

            return (
              <div key={p.label} className={`p-4 rounded-2xl border-2 transition-all ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
              }`}>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                  <span className={`font-black ${textHeading}`}>{p.label}</span>
                  <span className={`font-mono font-black text-sm sm:text-base ${textHeading}`}>{val}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent > 70 ? 'bg-rose-600' : percent > 40 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-black text-slate-500">{p.unit}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
