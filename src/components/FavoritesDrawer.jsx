import React from 'react';
import { X, Star, MapPin, Trash2, ArrowRight } from 'lucide-react';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites = [],
  onSelectCity,
  onRemoveFavorite,
  currentCity,
  isDark = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className={`w-full max-w-md h-full border-l shadow-2xl flex flex-col p-6 overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Drawer Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-500">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-space font-bold text-lg">Favorite Cities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {favorites.length} pinned destination{favorites.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Favorite Cities List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {favorites.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No favorite locations yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Click the "Save" star button on any city card to quickly access it here.
              </p>
            </div>
          ) : (
            favorites.map((city) => {
              const isSelected = currentCity?.id === city.id || currentCity?.name === city.name;

              return (
                <div
                  key={city.id || `${city.lat}-${city.lon}`}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? isDark
                        ? 'bg-sky-500/20 border-sky-400/40 text-white'
                        : 'bg-sky-50 border-sky-300 text-sky-950'
                      : isDark
                      ? 'bg-slate-800/50 border-slate-750 hover:bg-slate-800 text-slate-200'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-white text-slate-800 shadow-2xs'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                  >
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{city.name}</span>
                        {city.countryCode && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {city.countryCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRemoveFavorite(city)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectCity(city);
                        onClose();
                      }}
                      className="p-2 rounded-xl text-slate-400 group-hover:text-sky-600 transition-colors cursor-pointer"
                      title="View forecast"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
