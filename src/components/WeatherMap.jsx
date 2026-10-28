import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { reverseGeocode } from '../services/weatherApi';
import { MapPin, Navigation, CloudRain, Sparkles, Loader2, Check } from 'lucide-react';

// Fix Leaflet default icon paths in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom stylish pulsing pin for selected weather station
const customWeatherIcon = new L.DivIcon({
  className: 'custom-weather-pin',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
      <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background-color: rgba(2, 132, 199, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #0369a1); border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.7); display: flex; align-items: center; justify-content: center;">
        <div style="width: 7px; height: 7px; border-radius: 50%; background-color: #ffffff;"></div>
      </div>
    </div>
    <style>
      @keyframes ping {
        75%, 100% { transform: scale(1.8); opacity: 0; }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Component to handle map clicks and reverse geocode
function LocationPickerHandler({ onLocationSelected, setIsResolving }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setIsResolving(true);
      try {
        const cityData = await reverseGeocode(lat, lng);
        onLocationSelected(cityData);
      } catch (err) {
        console.error('Map location reverse geocode error:', err);
      } finally {
        setIsResolving(false);
      }
    },
  });
  return null;
}

// Component to smoothly animate the map when the city coordinates change externally
function MapViewController({ center, zoom = 11, recenterTrigger = 0 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.flyTo(center, zoom, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, recenterTrigger, map]);
  return null;
}

export default function WeatherMap({
  currentCity,
  onSelectCity,
  weather,
  unit = 'C',
  isDark = false,
  height = '520px',
}) {
  const [showRadarOverlay, setShowRadarOverlay] = useState(false);
  const [radarPath, setRadarPath] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [recenterCount, setRecenterCount] = useState(0);

  const centerPos = [currentCity?.lat || 18.5204, currentCity?.lon || 73.8567];

  // Fetch RainViewer radar overlay path
  useEffect(() => {
    let isMounted = true;
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.radar?.past?.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1];
          setRadarPath(latest.path);
        }
      })
      .catch((err) => console.warn('Radar overlay fetch warning:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLocationPicked = (cityData) => {
    onSelectCity(cityData);
  };

  const currentTemp = weather?.current?.temperature_2m !== undefined
    ? Math.round(unit === 'F' ? (weather.current.temperature_2m * 9) / 5 + 32 : weather.current.temperature_2m)
    : null;

  return (
    <div className={`w-full max-w-7xl mx-auto my-8 rounded-3xl p-6 sm:p-8 border shadow-xl backdrop-blur-2xl transition-all ${
      isDark ? 'bento-card-dark text-white' : 'bento-card-light text-slate-900'
    }`}>
      {/* Map Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-space text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white flex flex-wrap items-center gap-2">
              <span>Interactive Weather Map & Location Selector</span>
              {isResolving && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-xs font-mono font-bold animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" /> Resolving Location...
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
              Powered by Leaflet & OpenStreetMap • Click anywhere on the map to load its live weather forecast
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* Radar Overlay Toggle */}
          <button
            onClick={() => setShowRadarOverlay(!showRadarOverlay)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer btn-interactive ${
              showRadarOverlay
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : isDark
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 shadow-2xs'
            }`}
            title="Toggle Live Rain Radar Overlay"
          >
            <CloudRain className="w-4 h-4" />
            <span>Rain Radar {showRadarOverlay ? 'Active' : 'Off'}</span>
          </button>

          {/* Quick Recenter Button */}
          <button
            onClick={() => setRecenterCount((c) => c + 1)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer btn-interactive ${
              isDark
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 shadow-2xs'
            }`}
            title="Center on active city"
          >
            <Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Center Active</span>
          </button>
        </div>
      </div>

      {/* MapContainer using Leaflet & OpenStreetMap */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-lg">
        <MapContainer
          center={centerPos}
          zoom={11}
          style={{ height: height, width: '100%', zIndex: 10 }}
          scrollWheelZoom={true}
        >
          {/* Smooth FlyTo controller */}
          <MapViewController center={centerPos} zoom={11} recenterTrigger={recenterCount} />

          {/* Map click listener to pick location */}
          <LocationPickerHandler
            onLocationSelected={handleLocationPicked}
            setIsResolving={setIsResolving}
          />

          {/* OpenStreetMap TileLayer with Leaflet */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Live Doppler Precipitation Radar TileLayer (maxNativeZoom 7 prevents zoom level unsupported message) */}
          {showRadarOverlay && radarPath && (
            <TileLayer
              url={`https://tilecache.rainviewer.com${radarPath}/256/{z}/{x}/{y}/2/1_1.png`}
              opacity={0.65}
              zIndex={100}
              maxNativeZoom={7}
              maxZoom={19}
            />
          )}

          {/* Active City Marker & Popup */}
          <Marker position={centerPos} icon={customWeatherIcon}>
            <Popup>
              <div className="p-1.5 text-slate-950 font-sans min-w-[200px]">
                <div className="flex items-center gap-1.5 text-sky-800 font-extrabold text-base">
                  <MapPin className="w-4 h-4 shrink-0 text-sky-600" />
                  <span>{currentCity.name}</span>
                  {currentCity.countryCode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-100 font-mono font-bold text-sky-900 border border-sky-300">
                      {currentCity.countryCode}
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {[currentCity.admin1, currentCity.country].filter(Boolean).join(', ')}
                </p>

                {currentTemp !== null && (
                  <div className="mt-2.5 pt-2 border-t border-slate-300 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-700">Live Temperature:</span>
                    <span className="text-xl font-extrabold font-space text-sky-950">
                      {currentTemp}°{unit}
                    </span>
                  </div>
                )}

                <div className="mt-1 text-[11px] font-bold text-slate-600 font-mono flex items-center justify-between">
                  <span>Lat: {currentCity.lat.toFixed(3)}</span>
                  <span>Lon: {currentCity.lon.toFixed(3)}</span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Weather forecast updated</span>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Instruction Badge */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-slate-950/95 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>Click any location on the map to load its weather forecast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
