import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { getCartoTileUrl, CARTO_ATTRIBUTION } from '../config/mapConfig';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RadarModal({ isOpen, onClose, city, isDark = false }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const radarLayerRef = useRef(null);

  const [radarFrames, setRadarFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [radarHost, setRadarHost] = useState('https://tilecache.rainviewer.com');

  // Fetch RainViewer radar metadata
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setRadarHost(data.host || 'https://tilecache.rainviewer.com');

        const frames = [];
        if (data.radar && data.radar.past) {
          frames.push(...data.radar.past);
        }
        if (data.radar && data.radar.nowcast) {
          frames.push(...data.radar.nowcast);
        }

        setRadarFrames(frames);
        setCurrentFrameIndex(Math.max(0, frames.length - 1));
      })
      .catch((err) => {
        console.error('Radar metadata error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = city?.lat || 51.505;
    const lon = city?.lon || -0.09;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 7,
      zoomControl: false,
    });

    L.tileLayer(getCartoTileUrl(isDark), {
      attribution: CARTO_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-radar-pin',
      html: `<div style="background-color: #0284c7; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(2,132,199,0.8);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    L.marker([lat, lon], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<strong>${city?.name || 'Selected City'}</strong><br/>Live Weather Radar`)
      .openPopup();

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, city, isDark]);

  // Update Radar Layer when frame changes
  useEffect(() => {
    if (!mapInstanceRef.current || radarFrames.length === 0) return;

    const activeFrame = radarFrames[currentFrameIndex];
    if (!activeFrame) return;

    if (radarLayerRef.current) {
      mapInstanceRef.current.removeLayer(radarLayerRef.current);
    }

    const radarUrl = `${radarHost}${activeFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    const newRadarLayer = L.tileLayer(radarUrl, {
      opacity: 0.72,
      zIndex: 100,
    });

    newRadarLayer.addTo(mapInstanceRef.current);
    radarLayerRef.current = newRadarLayer;
  }, [currentFrameIndex, radarFrames, radarHost]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying || radarFrames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length);
    }, 850);

    return () => clearInterval(interval);
  }, [isPlaying, radarFrames]);

  if (!isOpen) return null;

  const currentTimestamp = radarFrames[currentFrameIndex]?.time;
  const frameTimeStr = currentTimestamp
    ? new Date(currentTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`relative w-full max-w-5xl h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between z-10 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-space font-bold text-base sm:text-lg flex items-center gap-2">
                Live Doppler Radar Map
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  LIVE STREAM
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Centered on {city?.name}, {city?.country}
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

        {/* Map Container */}
        <div className="relative flex-1 w-full bg-slate-100 dark:bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className={`p-2 rounded-xl border shadow-lg cursor-pointer ${
                isDark ? 'bg-slate-900/90 text-white border-slate-700' : 'bg-white/95 text-slate-800 border-slate-200'
              }`}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className={`p-2 rounded-xl border shadow-lg cursor-pointer ${
                isDark ? 'bg-slate-900/90 text-white border-slate-700' : 'bg-white/95 text-slate-800 border-slate-200'
              }`}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Color Scale Legend */}
          <div className={`absolute bottom-4 left-4 z-10 p-3 rounded-2xl border shadow-lg text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-700 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'
          }`}>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block mb-1">
              Rain Intensity (dBZ)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Light</span>
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500" />
              <span className="text-[10px] text-slate-400">Heavy</span>
            </div>
          </div>
        </div>

        {/* Timeline Controller Bar */}
        <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-4 z-10 ${
          isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-xs cursor-pointer transition-all"
              title={isPlaying ? 'Pause animation' : 'Play animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Radar Frame Time
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {frameTimeStr || 'Streaming live...'}
              </p>
            </div>
          </div>

          {/* Frame Scrubber */}
          <div className="flex-1 max-w-md mx-2">
            <input
              type="range"
              min={0}
              max={Math.max(0, radarFrames.length - 1)}
              value={currentFrameIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentFrameIndex(Number(e.target.value));
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>-1 hr</span>
              <span>Past Radar</span>
              <span>Live</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (city) {
                mapInstanceRef.current?.setView([city.lat, city.lon], 7);
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-colors cursor-pointer ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-500" /> Recenter
          </button>
        </div>
      </div>
    </div>
  );
}
