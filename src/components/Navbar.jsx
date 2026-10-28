import React from 'react';
import { Wind, AlertTriangle, Star, Sun, Moon, Settings, MapPin } from 'lucide-react';

export default function Navbar({
  unit = 'C',
  onToggleUnit,
  activeTab = 'overview',
  setActiveTab,
  onOpenRadar,
  alertsCount = 0,
  onScrollToAlerts,
  favoritesCount = 0,
  onOpenFavorites,
  isDark = false,
  onToggleDark,
  onOpenSettings,
  quickCities = [],
  currentCity,
  onSelectCity,
}) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
      isDark
        ? 'bg-slate-900/90 border-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.4)] text-slate-100'
        : 'bg-white/95 border-slate-300/80 shadow-[0_2px_15px_-3px_rgba(15,23,42,0.06)] text-slate-900'
    }`}>
      <div className="h-18 sm:h-20 max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between gap-3">
        {/* Brand & Nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-500 flex items-center justify-center shadow-md shadow-sky-600/30 text-white">
              <Wind className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-space text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white block leading-none">
                AuraSky
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400 block mt-0.5">
                Atmospheric Intelligence
              </span>
            </div>
          </div>

          {/* Navigation links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1.5 text-sm font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer btn-interactive ${
                activeTab === 'overview'
                  ? isDark
                    ? 'bg-sky-600 text-white font-extrabold shadow-sm'
                    : 'bg-sky-50 text-sky-900 font-extrabold shadow-xs border border-sky-300'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('radar');
                onOpenRadar();
              }}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer btn-interactive ${
                activeTab === 'radar'
                  ? isDark
                    ? 'bg-sky-600 text-white font-extrabold shadow-sm'
                    : 'bg-sky-50 text-sky-900 font-extrabold shadow-xs border border-sky-300'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Interactive Map & Radar
            </button>
            <button
              onClick={() => {
                setActiveTab('alerts');
                onScrollToAlerts();
              }}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 btn-interactive ${
                activeTab === 'alerts'
                  ? isDark
                    ? 'bg-sky-600 text-white font-extrabold shadow-sm'
                    : 'bg-sky-50 text-sky-900 font-extrabold shadow-xs border border-sky-300'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span>Alerts Monitor</span>
              {alertsCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse ring-2 ring-rose-200 dark:ring-rose-900" />
              )}
            </button>
          </nav>
        </div>

        {/* Quick City Temperature Pills */}
        {quickCities.length > 0 && (
          <div className="hidden 2xl:flex items-center gap-2">
            {quickCities.slice(0, 4).map((city) => {
              const isSelected = currentCity?.name === city.name;
              return (
                <button
                  key={city.name}
                  onClick={() => onSelectCity(city)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer btn-interactive ${
                    isSelected
                      ? 'bg-sky-600 text-white font-extrabold shadow-sm shadow-sky-600/30'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                      : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-2xs'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{city.name}</span>
                  {city.temp !== undefined && (
                    <span className={`font-mono font-extrabold ${isSelected ? 'text-white' : 'text-sky-700 dark:text-sky-400'}`}>
                      {city.temp}°
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Segmented Unit Toggle (°C / °F) */}
          <div className={`flex items-center p-1 rounded-full border transition-colors shadow-2xs ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => onToggleUnit('C')}
              className={`px-3 py-1 rounded-full font-mono text-xs font-extrabold transition-all cursor-pointer ${
                unit === 'C'
                  ? isDark
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-sky-950 font-black shadow-xs border border-slate-200'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => onToggleUnit('F')}
              className={`px-3 py-1 rounded-full font-mono text-xs font-extrabold transition-all cursor-pointer ${
                unit === 'F'
                  ? isDark
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-sky-950 font-black shadow-xs border border-slate-200'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              °F
            </button>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleDark}
            className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer btn-interactive overflow-hidden ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-750'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-2xs'
            }`}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            <div className={`transition-transform duration-500 ease-out ${isDark ? 'rotate-180 scale-105' : 'rotate-0 scale-100'}`}>
              {isDark ? <Sun className="w-4 h-4 stroke-[2.5]" /> : <Moon className="w-4 h-4 stroke-[2.5]" />}
            </div>
          </button>

          {/* Alerts Bell Button */}
          <button
            onClick={onScrollToAlerts}
            className={`relative p-2.5 rounded-full border transition-all cursor-pointer btn-interactive ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-750'
                : 'bg-white border-slate-300 text-slate-800 hover:text-slate-950 hover:bg-slate-100 shadow-2xs'
            }`}
            title="Weather Alerts"
          >
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            {alertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className={`relative p-2.5 rounded-full border transition-all cursor-pointer btn-interactive ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750'
                : 'bg-white border-slate-300 text-amber-600 hover:bg-slate-100 shadow-2xs'
            }`}
            title="Favorite Cities"
          >
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Settings modal */}
          <button
            onClick={onOpenSettings}
            className={`p-2.5 rounded-full border transition-all cursor-pointer btn-interactive ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white border-slate-300 text-slate-800 hover:text-slate-950 shadow-2xs'
            }`}
            title="Settings & Preferences"
          >
            <Settings className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
}
