import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Clock, Sparkles } from 'lucide-react';
import { searchCities } from '../services/weatherApi';

export default function SearchBar({
  onSelectCity,
  onUseCurrentLocation,
  isLocating = false,
  recentSearches = [],
  onClearRecent,
  isDark = false,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const cities = await searchCities(query);
      setResults(cities);
      setIsLoading(false);
      setIsOpen(true);
      setSelectedIndex(-1);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-40 mb-6">
      <div className="relative flex items-center">
        {/* Search Input Box */}
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-4.5 pointer-events-none text-slate-500 dark:text-slate-400">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
            ) : (
              <Search className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim().length < 2) {
                setResults([]);
              }
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search any city, town, state, or country..."
            className={`w-full pl-12 pr-24 py-3.5 text-sm sm:text-base font-semibold rounded-full border-2 transition-all shadow-sm ${
              isDark
                ? 'bg-slate-900/90 focus:bg-slate-900 text-white placeholder-slate-400 border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30'
                : 'bg-white focus:bg-white text-slate-950 placeholder-slate-500 border-slate-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/25 shadow-xs'
            }`}
          />

          {/* Right badge: Clear or ⌘K keyboard shortcut indicator */}
          <div className="absolute right-4 flex items-center gap-1.5">
            {query ? (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                }}
                className="p-1 rounded-full text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className={`hidden sm:inline-block py-1 px-2 rounded-lg text-xs font-mono font-bold border shadow-xs ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Use My Location Button */}
        <button
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className="ml-3 px-4.5 py-3.5 bg-sky-600 hover:bg-sky-500 active:scale-95 disabled:opacity-60 text-white font-extrabold rounded-full flex items-center gap-2 shadow-md shadow-sky-600/30 transition-all text-xs sm:text-sm whitespace-nowrap cursor-pointer btn-interactive"
          title="Detect GPS location"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
          ) : (
            <MapPin className="w-4 h-4 stroke-[2.5]" />
          )}
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Autocomplete / Recent Searches Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-2.5 rounded-3xl border-2 shadow-2xl overflow-hidden z-50 divide-y ${
          isDark
            ? 'bg-slate-900 border-slate-700 divide-slate-800 text-white'
            : 'bg-white border-slate-300 divide-slate-100 shadow-[0_16px_36px_-4px_rgba(15,23,42,0.15)] text-slate-900'
        }`}>
          {/* Active Search Results */}
          {results.length > 0 && (
            <div className="py-2.5">
              <div className={`px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-sky-400' : 'text-sky-800'
              }`}>
                <Sparkles className="w-4 h-4" /> Matching Locations
              </div>
              {results.map((city, idx) => (
                <button
                  key={`${city.id}-${idx}`}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-5 py-3 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedIndex === idx
                      ? isDark
                        ? 'bg-sky-500/20 text-white'
                        : 'bg-sky-50 text-sky-950 font-bold'
                      : isDark
                      ? 'text-slate-200 hover:bg-slate-800'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-sm sm:text-base">{city.name}</span>
                      <span className={`text-xs ml-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  {city.countryCode && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-md font-mono font-bold ${
                      isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}>
                      {city.countryCode}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {query.trim().length >= 2 && !isLoading && results.length === 0 && (
            <div className={`px-5 py-6 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              No matching locations found for "{query}". Try checking your spelling.
            </div>
          )}

          {/* Recent Searches Section */}
          {query.trim().length < 2 && recentSearches.length > 0 && (
            <div className="py-2.5">
              <div className="px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recent Searches
                </span>
                {onClearRecent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearRecent();
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>
              {recentSearches.slice(0, 5).map((city, idx) => (
                <button
                  key={`recent-${city.id || city.name}-${idx}`}
                  onClick={() => handleSelect(city)}
                  className={`w-full px-5 py-3 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-extrabold text-sm sm:text-base">{city.name}</span>
                      <span className={`text-xs ml-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  {city.countryCode && (
                    <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {city.countryCode}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
