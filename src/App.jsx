import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import AlertBanner from './components/AlertBanner';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import WeatherMetricsGrid from './components/WeatherMetricsGrid';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import AirQualityCard from './components/AirQualityCard';
import WeatherBackground from './components/WeatherBackground';
import WeatherMap from './components/WeatherMap';
import RadarModal from './components/RadarModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import SettingsModal from './components/SettingsModal';
import {
  fetchWeatherData,
  fetchAirQuality,
  reverseGeocode,
} from './services/weatherApi';
import { detectExtremeWeatherAlerts } from './services/alertsEngine';
import { getWeatherInfo, convertTemp } from './services/weatherUtils';
import { AlertCircle, Loader2, Wind } from 'lucide-react';

const STORAGE_KEYS = {
  CITY: 'aurasky_last_city',
  UNIT: 'aurasky_unit',
  WIND_UNIT: 'aurasky_wind_unit',
  PRESSURE_UNIT: 'aurasky_pressure_unit',
  FAVORITES: 'aurasky_favorites',
  RECENT: 'aurasky_recent_searches',
  THEME: 'aurasky_theme_dark',
};

// Preset cities with Stitch coordinates
const PRESET_CITIES = [
  { id: 5391959, name: 'San Francisco', admin1: 'California', country: 'United States', countryCode: 'US', lat: 37.77493, lon: -122.41942, timezone: 'America/Los_Angeles' },
  { id: 1850147, name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6895, lon: 139.69171, timezone: 'Asia/Tokyo' },
  { id: 2643743, name: 'London', admin1: 'England', country: 'United Kingdom', countryCode: 'GB', lat: 51.50853, lon: -0.12574, timezone: 'Europe/London' },
  { id: 5128581, name: 'New York', admin1: 'New York', country: 'United States', countryCode: 'US', lat: 40.71427, lon: -74.00597, timezone: 'America/New_York' },
];

export default function App() {
  // Theme state: defaults to false (Light Morning Edition from Stitch)
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'true';
  });

  const [activeTab, setActiveTab] = useState('overview');
  const alertsSectionRef = useRef(null);
  const mapSectionRef = useRef(null);

  // Unit preferences
  const [unit, setUnit] = useState(() => localStorage.getItem(STORAGE_KEYS.UNIT) || 'C');
  const [windUnit, setWindUnit] = useState(() => localStorage.getItem(STORAGE_KEYS.WIND_UNIT) || 'kmh');
  const [pressureUnit, setPressureUnit] = useState(() => localStorage.getItem(STORAGE_KEYS.PRESSURE_UNIT) || 'hPa');

  // Favorites & Recent searches
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT)) || [];
    } catch {
      return [];
    }
  });

  // Current City (defaults to San Francisco from Stitch screen or saved)
  const [currentCity, setCurrentCity] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CITY);
      return saved ? JSON.parse(saved) : PRESET_CITIES[0];
    } catch {
      return PRESET_CITIES[0];
    }
  });

  // Data states
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  // Quick preset cities with live temp preview
  const [presetWithTemps, setPresetWithTemps] = useState(PRESET_CITIES);

  // Modals
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, isDark.toString());
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNIT, unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WIND_UNIT, windUnit);
  }, [windUnit]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRESSURE_UNIT, pressureUnit);
  }, [pressureUnit]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    if (currentCity) {
      localStorage.setItem(STORAGE_KEYS.CITY, JSON.stringify(currentCity));
    }
  }, [currentCity]);

  // Load weather and air quality for active city
  const loadWeatherData = useCallback(async (city, isRefreshAction = false) => {
    if (!city || !city.lat || !city.lon) return;

    if (isRefreshAction) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [weather, aqi] = await Promise.all([
        fetchWeatherData(city.lat, city.lon, city.timezone),
        fetchAirQuality(city.lat, city.lon),
      ]);

      setWeatherData(weather);
      setAqiData(aqi);

      // Synthesize alerts
      const generatedAlerts = detectExtremeWeatherAlerts(weather, aqi);
      setAlerts(generatedAlerts);
    } catch (err) {
      console.error('Failed to load weather:', err);
      setError('Unable to retrieve current weather data. Please check your network connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch when city changes
  useEffect(() => {
    if (currentCity) {
      loadWeatherData(currentCity);
    }
  }, [currentCity, loadWeatherData]);

  // Background fetch temperatures for preset chips
  useEffect(() => {
    let isSubscribed = true;
    async function fetchPresetTemps() {
      try {
        const updated = await Promise.all(
          PRESET_CITIES.map(async (c) => {
            try {
              const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m`
              );
              const d = await res.json();
              return { ...c, temp: convertTemp(d?.current?.temperature_2m, unit) };
            } catch {
              return c;
            }
          })
        );
        if (isSubscribed) setPresetWithTemps(updated);
      } catch {
        // Fallback
      }
    }
    fetchPresetTemps();
    return () => {
      isSubscribed = false;
    };
  }, [unit]);

  const handleSelectCity = (city) => {
    setCurrentCity(city);
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.name !== city.name || c.country !== city.country);
      return [city, ...filtered].slice(0, 10);
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const locCity = await reverseGeocode(latitude, longitude);
          handleSelectCity(locCity);
        } catch {
          setError('Failed to resolve current location details.');
        } finally {
          setIsLocating(false);
        }
      },
      (geoErr) => {
        setIsLocating(false);
        setError(`Location access denied or unavailable: ${geoErr.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleToggleFavorite = (city) => {
    const exists = favorites.some((f) => f.name === city.name && f.country === city.country);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => !(f.name === city.name && f.country === city.country)));
    } else {
      setFavorites((prev) => [...prev, city]);
    }
  };

  const isCurrentFavorite = favorites.some(
    (f) => f.name === currentCity?.name && f.country === currentCity?.country
  );

  const scrollToAlerts = () => {
    alertsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const weatherType = weatherData?.current
    ? getWeatherInfo(weatherData.current.weather_code, weatherData.current.is_day).type
    : 'clear';
  const isDay = weatherData?.current ? weatherData.current.is_day : 1;

  return (
    <div className={`min-h-screen relative flex flex-col justify-between transition-colors duration-300 ${
      isDark ? 'text-slate-100 selection:bg-sky-500 selection:text-white' : 'text-slate-800 selection:bg-sky-100 selection:text-sky-900'
    }`}>
      {/* Stitch Ambient Animated Background */}
      <WeatherBackground weatherType={weatherType} isDay={isDay} isDark={isDark} />

      {/* Main Container */}
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <Navbar
          unit={unit}
          onToggleUnit={(newUnit) => setUnit(newUnit)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenRadar={scrollToMap}
          alertsCount={alerts.length}
          onScrollToAlerts={scrollToAlerts}
          favoritesCount={favorites.length}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          quickCities={presetWithTemps}
          currentCity={currentCity}
          onSelectCity={handleSelectCity}
        />

        {/* Global Search Bar with ⌘K */}
        <SearchBar
          onSelectCity={handleSelectCity}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLocating={isLocating}
          recentSearches={recentSearches}
          onClearRecent={() => setRecentSearches([])}
          isDark={isDark}
        />

        {/* Error notification banner */}
        {error && (
          <div className={`w-full max-w-7xl mx-auto my-4 p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-3 shadow-sm ${
            isDark ? 'bg-rose-950/80 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={() => loadWeatherData(currentCity)}
              className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !weatherData && (
          <div className={`w-full max-w-7xl mx-auto my-12 flex flex-col items-center justify-center p-16 rounded-3xl border text-center animate-pulse ${
            isDark ? 'bento-card-dark' : 'bento-card-light'
          }`}>
            <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
            <p className="font-space text-lg font-bold">Synchronizing Atmospheric Telemetry...</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connecting to WMO meteorological satellites and RainViewer Doppler radar</p>
          </div>
        )}

        {/* Main Dashboard Bento Sections */}
        {weatherData && (
          <main className="space-y-6 animate-fade-in">
            {/* Active Extreme Weather Alert Banner (Stitch Signature) */}
            <div ref={alertsSectionRef}>
              <AlertBanner alerts={alerts} isDark={isDark} />
            </div>

            {/* Hero Weather Bento Card (8 Cols Primary + 4 Cols Mini Radar) */}
            <CurrentWeatherCard
              city={currentCity}
              weather={weatherData}
              unit={unit}
              windUnit={windUnit}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
              onRefresh={() => loadWeatherData(currentCity, true)}
              isRefreshing={isRefreshing}
              onOpenRadarModal={() => setIsRadarOpen(true)}
              isDark={isDark}
            />

            {/* Interactive React-Leaflet Map & Location Picker */}
            <div ref={mapSectionRef}>
              <WeatherMap
                currentCity={currentCity}
                onSelectCity={handleSelectCity}
                weather={weatherData}
                unit={unit}
                isDark={isDark}
              />
            </div>

            {/* Sensor & Telemetry Metrics Grid */}
            <WeatherMetricsGrid
              weather={weatherData}
              windUnit={windUnit}
              pressureUnit={pressureUnit}
              isDark={isDark}
            />

            {/* Hourly Continuous Curve & Timeline */}
            <HourlyForecast
              weather={weatherData}
              unit={unit}
              windUnit={windUnit}
              isDark={isDark}
            />

            {/* 7-Day Extended Outlook */}
            <DailyForecast
              weather={weatherData}
              unit={unit}
              windUnit={windUnit}
              isDark={isDark}
            />

            {/* Air Quality Index Breakdown */}
            <AirQualityCard aqiData={aqiData} isDark={isDark} />
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className={`w-full max-w-7xl mx-auto py-6 px-4 border-t text-xs transition-colors ${
        isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="flex items-center gap-1.5 justify-center">
            <Wind className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>AuraSky • Live Atmospheric Intelligence & Extreme Weather Alerts</span>
          </p>
          <p>
            Stitch Design System • Open-Meteo & RainViewer Doppler Radar APIs
          </p>
        </div>
      </footer>

      {/* Fullscreen Interactive Doppler Radar Modal */}
      <RadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        city={currentCity}
        isDark={isDark}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectCity={handleSelectCity}
        onRemoveFavorite={handleToggleFavorite}
        currentCity={currentCity}
        isDark={isDark}
      />

      {/* Preference Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tempUnit={unit}
        setTempUnit={setUnit}
        windUnit={windUnit}
        setWindUnit={setWindUnit}
        pressureUnit={pressureUnit}
        setPressureUnit={setPressureUnit}
        isDark={isDark}
      />
    </div>
  );
}
