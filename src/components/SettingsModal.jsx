import React from 'react';
import { X, Settings, Thermometer, Wind, Gauge, Info } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  tempUnit,
  setTempUnit,
  windUnit,
  setWindUnit,
  pressureUnit,
  setPressureUnit,
  isDark = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-750 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-space font-bold text-lg">Weather Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Telemetry units & sensors</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="py-5 space-y-5 text-sm">
          {/* Temperature Unit */}
          <div>
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2 text-xs uppercase tracking-wider">
              <Thermometer className="w-4 h-4 text-sky-500" />
              <span>Temperature Scale</span>
            </label>
            <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setTempUnit('C')}
                className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  tempUnit === 'C'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => setTempUnit('F')}
                className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  tempUnit === 'F'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Wind Speed Unit */}
          <div>
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2 text-xs uppercase tracking-wider">
              <Wind className="w-4 h-4 text-teal-500" />
              <span>Wind Velocity Unit</span>
            </label>
            <div className={`grid grid-cols-3 gap-2 p-1 rounded-2xl border ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setWindUnit('kmh')}
                className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  windUnit === 'kmh'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                km/h
              </button>
              <button
                onClick={() => setWindUnit('mph')}
                className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  windUnit === 'mph'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                mph
              </button>
              <button
                onClick={() => setWindUnit('ms')}
                className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  windUnit === 'ms'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                m/s
              </button>
            </div>
          </div>

          {/* Barometric Pressure Unit */}
          <div>
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-2 text-xs uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-indigo-500" />
              <span>Barometer Unit</span>
            </label>
            <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setPressureUnit('hPa')}
                className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  pressureUnit === 'hPa'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                hPa / mbar
              </button>
              <button
                onClick={() => setPressureUnit('inHg')}
                className={`py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  pressureUnit === 'inHg'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                inHg
              </button>
            </div>
          </div>

          {/* Data Notice */}
          <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
            isDark ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Info className="w-4 h-4 text-sky-500" />
              <span>AuraSky Architecture</span>
            </div>
            <p>
              Data streamed via <strong>Open-Meteo</strong> & <strong>RainViewer Doppler Radar</strong>. UI powered by Stitch Design System.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-3 border-t flex justify-end ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
