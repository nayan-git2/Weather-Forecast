# SkyCast — Modern Weather Forecast & Extreme Weather Alerts Application

SkyCast is a modern, responsive web application that provides real-time weather information, 24-hour hourly trend analytics, 7-day extended forecasts, and intelligent extreme weather alerts for cities worldwide.

Built with **React 19**, **Vite**, **Tailwind CSS**, **Lucide Icons**, and **Leaflet**.

---

## 🌟 Key Features

### 1. 🔍 Real-Time City Search & Geolocation
- **Instant Search with Autocomplete:** Search for any city, state, or country worldwide with fast debounced geocoding.
- **GPS Location Detection:** One-click **"My Location"** button automatically fetches your coordinates and reverse-geocodes your local city.
- **Popular City Pills:** Single-click access to global hubs (London, New York, Tokyo, Paris, Sydney, Dubai, Mumbai, Singapore).
- **Recent Searches & Favorites:** Save frequent destinations with persistent browser storage.

### 2. ☀️ Comprehensive Current Weather Display
- **Live Temperature & Feels-Like:** Real-time readings with instant toggle between Celsius (`°C`) and Fahrenheit (`°F`).
- **Dynamic Condition Badges & Icons:** Beautiful icons and labels mapping to official WMO standard weather codes.
- **Today's Min & Max Temperatures:** Clear high/low indicators for current daylight cycle.
- **Local Time & Timezone:** Accurate local time calculation reflecting the selected city's timezone.

### 3. 📊 Essential Meteorological Metrics Grid
- **Humidity:** Relative humidity with comfort rating and visual gauge.
- **Wind Speed & Direction:** Real-time wind speed (`km/h`, `mph`, or `m/s`), gust forecasts, and an interactive rotating compass pointer.
- **Chances of Rain:** Precipitation probability percentage and expected rainfall volume in millimeters.
- **UV Radiation Index:** Color-coded solar UV intensity meter (Low to Extreme) with safety recommendations.
- **Atmospheric Pressure:** Barometric surface and sea-level pressure (`hPa` or `inHg`) with high/low stability trend.
- **Cloud Cover & Sky State:** Percentage of cloud cover.
- **Solar Arc (Sunrise & Sunset):** Visual daylight progress bar displaying sunrise and sunset times.

### 4. ⚠️ Intelligent Extreme Weather Alerts Engine
- Automatically evaluates meteorological thresholds across current and forecasted conditions:
  - **Extreme Heat Warning / Heat Advisory** (temperatures > 38°C or heat index > 40°C)
  - **Severe Thunderstorm & Hail Hazard** (lightning and damaging hail)
  - **High Wind Warning / Gale Advisory** (sustained winds > 45 km/h, gusts > 65 km/h)
  - **Torrential Rain & Flash Flood Watch** (precipitation > 25 mm or violent downpours)
  - **Sub-Zero Freeze / Frost Warning** (temperatures <= 0°C with freeze precautions)
  - **Dangerous UV Radiation Alert** (UV index >= 8)
  - **Dense Fog & Low Visibility Advisory**
  - **Hazardous Air Quality Alert** (AQI > 150)
- Includes expandable precautionary safety guidance for each warning.

### 5. ⏱️ 24-Hour Hourly Forecast (Dual-Mode)
- **Cards View:** Smooth horizontal slider showing hour-by-hour temperature, condition icons, rain chance percentages, and wind speeds.
- **Interactive Trend Chart:** Smooth SVG temperature curve with area gradient and rain probability volume bars.

### 6. 📅 7-Day Extended Multi-Day Forecast
- Detailed day-by-day weather breakdown.
- **Dynamic Temperature Range Visualizer:** Colored horizontal range bar illustrating each day's high/low spread relative to the entire week.
- Expandable daily details including sunrise, sunset, peak winds, UV index, and total rain volume.

### 7. 🍃 Real-Time Air Quality Index (AQI)
- US EPA Standard AQI status (Good, Moderate, Unhealthy, Hazardous).
- Detailed pollutant concentrations: **PM2.5**, **PM10**, **Ozone (O₃)**, **Nitrogen Dioxide (NO₂)**, **Sulphur Dioxide (SO₂)**, and **Carbon Monoxide (CO)**.

### 8. 🛰️ Live Doppler Precipitation Radar Map
- Integrated interactive map powered by **Leaflet** and **RainViewer API**.
- Real-time animated radar frames with playback controls, timeline scrubber, and rain intensity color legend.

### 9. 🎨 Adaptive Atmospheric Ambiance
- Dynamic ambient background gradients and subtle CSS animations (sun flare rays, falling rain streaks, drifting snowflakes, starry night twinkles) that react to the active weather condition and day/night cycle.

---

## 🛠️ Tech Stack & Data Sources

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (Modern Glassmorphism UI)
- **Icons:** Lucide React
- **Mapping & Radar:** Leaflet + RainViewer Open Radar API
- **Weather Data:** [Open-Meteo API](https://open-meteo.com/) (100% Free, No API key required)
- **Air Quality Data:** Open-Meteo Air Quality API
- **Geocoding:** Open-Meteo Geocoding API + BigDataCloud Reverse Geocoding

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.
