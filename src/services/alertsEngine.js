/**
 * Real-time extreme weather alert engine.
 * Synthesizes data from current weather, daily forecasts, hourly trends, and air quality
 * to detect severe and hazardous conditions according to National Weather Service (NWS)
 * and WMO meteorological alert thresholds.
 */

export function detectExtremeWeatherAlerts(weatherData, aqiData) {
  if (!weatherData || !weatherData.current) return [];

  const alerts = [];
  const current = weatherData.current;
  const daily = weatherData.daily || {};

  const todayMaxTemp = daily.temperature_2m_max ? daily.temperature_2m_max[0] : current.temperature_2m;
  const todayMinTemp = daily.temperature_2m_min ? daily.temperature_2m_min[0] : current.temperature_2m;
  const todayMaxWind = daily.wind_speed_10m_max ? daily.wind_speed_10m_max[0] : current.wind_speed_10m;
  const todayPrecip = daily.precipitation_sum ? daily.precipitation_sum[0] : (current.precipitation || 0);
  const todayMaxUv = daily.uv_index_max ? daily.uv_index_max[0] : (current.uv_index || 0);

  // 1. Extreme Heat Warning
  if (current.apparent_temperature >= 40 || todayMaxTemp >= 39) {
    alerts.push({
      id: 'extreme-heat',
      severity: 'danger',
      category: 'Extreme Heat Warning',
      title: 'Dangerous Heat Wave in Effect',
      description: `High heat indices detected (up to ${Math.round(todayMaxTemp)}°C / feels like ${Math.round(current.apparent_temperature)}°C). Prolonged exposure may lead to heat exhaustion or heat stroke.`,
      safetyTips: [
        'Stay indoors in air-conditioned buildings during peak midday hours.',
        'Drink plenty of hydrating fluids even if you do not feel thirsty.',
        'Never leave children or pets in unattended motor vehicles.',
      ],
      urgency: 'Immediate',
      issuedFor: 'Excessive Temperatures',
    });
  } else if (todayMaxTemp >= 35 || current.apparent_temperature >= 36) {
    alerts.push({
      id: 'heat-advisory',
      severity: 'warning',
      category: 'Heat Advisory',
      title: 'Elevated Heat and Humidity',
      description: `Temperatures reaching ${Math.round(todayMaxTemp)}°C with elevated humidity levels.`,
      safetyTips: [
        'Limit strenuous outdoor activities to early morning or evening hours.',
        'Wear lightweight, loose-fitting clothing.',
        'Keep well-hydrated throughout the day.',
      ],
      urgency: 'Expected',
      issuedFor: 'Elevated Heat',
    });
  }

  // 2. Severe Thunderstorm & Hail Warning
  if (current.weather_code === 99 || (daily.weather_code && daily.weather_code[0] === 99)) {
    alerts.push({
      id: 'severe-thunderstorm-hail',
      severity: 'danger',
      category: 'Severe Thunderstorm Warning',
      title: 'Severe Thunderstorm with Hail Hazard',
      description: 'Violent thunderstorms accompanied by damaging winds and potential large hail stones detected in the immediate area.',
      safetyTips: [
        'Seek shelter immediately in a sturdy interior room away from windows.',
        'Protect vehicles from hail damage under covered structures.',
        'Unplug sensitive electronic devices and avoid touching wired appliances.',
      ],
      urgency: 'Immediate',
      issuedFor: 'Severe Thunderstorm / Hail',
    });
  } else if ([95, 96].includes(current.weather_code) || (daily.weather_code && [95, 96].includes(daily.weather_code[0]))) {
    alerts.push({
      id: 'thunderstorm-warning',
      severity: 'warning',
      category: 'Thunderstorm Warning',
      title: 'Active Thunderstorm Alert',
      description: 'Thunderstorms with lightning, gusty winds, and localized heavy downpours observed or forecasted.',
      safetyTips: [
        'When thunder roars, go indoors. Stay away from open bodies of water.',
        'Avoid tall solitary trees, metal fences, and elevated ground.',
        'Allow extra travel time due to sudden wet road conditions.',
      ],
      urgency: 'Expected',
      issuedFor: 'Thunderstorm & Lightning',
    });
  }

  // 3. High Wind / Gale Warning
  if (current.wind_gusts_10m >= 70 || todayMaxWind >= 60) {
    alerts.push({
      id: 'high-wind-danger',
      severity: 'danger',
      category: 'High Wind Warning',
      title: 'Damaging Wind Gusts Detected',
      description: `Peak wind gusts exceeding ${Math.round(current.wind_gusts_10m || todayMaxWind)} km/h. Tree branches may break and loose objects can become dangerous projectiles.`,
      safetyTips: [
        'Secure outdoor furniture, trash bins, and loose objects.',
        'Exercise extreme caution if driving high-profile vehicles.',
        'Watch for falling tree limbs and downed power cables.',
      ],
      urgency: 'Immediate',
      issuedFor: 'Gale Force Winds',
    });
  } else if (current.wind_speed_10m >= 45 || current.wind_gusts_10m >= 50) {
    alerts.push({
      id: 'wind-advisory',
      severity: 'warning',
      category: 'Wind Advisory',
      title: 'Gusty Winds in the Region',
      description: `Sustained winds of ${Math.round(current.wind_speed_10m)} km/h with gusts up to ${Math.round(current.wind_gusts_10m)} km/h.`,
      safetyTips: [
        'Keep a firm grip on steering wheels when traveling on open highways.',
        'Ensure patio umbrellas and lightweight decor are tied down.',
      ],
      urgency: 'Expected',
      issuedFor: 'Strong Wind Gusts',
    });
  }

  // 4. Heavy Rain & Flash Flood Risk
  if (current.weather_code === 82 || current.precipitation >= 12 || todayPrecip >= 35) {
    alerts.push({
      id: 'heavy-rain-flood',
      severity: 'danger',
      category: 'Flash Flood Watch',
      title: 'Heavy Torrential Downpours & Flood Risk',
      description: `Significant rainfall volume expected (${Math.round(todayPrecip)} mm). Rapid runoff and pooling on roadways may cause hazardous driving conditions.`,
      safetyTips: [
        'Never drive or walk into flooded roadways: Turn around, don’t drown!',
        'Move essential items to higher ground if located in flood-prone lowlands.',
        'Monitor local emergency broadcasts for flash flood updates.',
      ],
      urgency: 'Expected',
      issuedFor: 'Torrential Precipitation',
    });
  } else if ([65, 81].includes(current.weather_code) || todayPrecip >= 20) {
    alerts.push({
      id: 'rain-advisory',
      severity: 'warning',
      category: 'Heavy Rain Advisory',
      title: 'Persistent Moderate-to-Heavy Rain',
      description: `Steadily accumulating rainfall (${Math.round(todayPrecip)} mm today). Reduced visibility and hydroplaning risks.`,
      safetyTips: [
        'Slow down on roads and maintain a safe following distance.',
        'Turn on low-beam headlights during heavy rainfall.',
      ],
      urgency: 'Expected',
      issuedFor: 'Road Water Accumulation',
    });
  }

  // 5. Freeze / Frost Warning
  if (current.temperature_2m <= 0 || todayMinTemp <= -2) {
    alerts.push({
      id: 'frost-freeze-warning',
      severity: 'danger',
      category: 'Freeze Warning',
      title: 'Sub-Zero Freezing Temperatures',
      description: `Sub-freezing conditions observed (${Math.round(current.temperature_2m)}°C). Frost and black ice may form on roads and overpasses.`,
      safetyTips: [
        'Protect sensitive outdoor vegetation and bring pets inside.',
        'Wrap exposed exterior water pipes to prevent burst pipes.',
        'Drive cautiously over bridges and shaded highway sections prone to black ice.',
      ],
      urgency: 'Immediate',
      issuedFor: 'Sub-Freezing Cold',
    });
  } else if (todayMinTemp <= 2) {
    alerts.push({
      id: 'frost-advisory',
      severity: 'warning',
      category: 'Frost Advisory',
      title: 'Cold Weather & Frost Notice',
      description: `Nighttime temperatures dipping near freezing (${Math.round(todayMinTemp)}°C). Tender plants may be damaged.`,
      safetyTips: [
        'Cover tender crops or outdoor plants with breathable fabric.',
        'Ensure outdoor domestic animals have warm sheltered dry bedding.',
      ],
      urgency: 'Watch',
      issuedFor: 'Frost Hazard',
    });
  }

  // 6. Extreme UV Radiation Warning
  if (todayMaxUv >= 9 || (current.uv_index && current.uv_index >= 9)) {
    alerts.push({
      id: 'uv-extreme',
      severity: 'warning',
      category: 'Very High UV Radiation Alert',
      title: 'Intense Solar UV Index',
      description: `UV Index reading of ${Math.round(todayMaxUv)}. Unprotected skin and eyes can burn rapidly in under 15 minutes.`,
      safetyTips: [
        'Wear SPF 30+ broad-spectrum sunscreen and UV-blocking sunglasses.',
        'Seek shade, particularly between 10 AM and 4 PM.',
        'Wear a wide-brimmed hat and protective clothing.',
      ],
      urgency: 'Expected',
      issuedFor: 'Solar UV Radiation',
    });
  }

  // 7. Dense Fog Advisory
  if ([45, 48].includes(current.weather_code)) {
    alerts.push({
      id: 'fog-advisory',
      severity: 'advisory',
      category: 'Dense Fog Advisory',
      title: 'Severely Reduced Visibility',
      description: 'Thick fog banks and moisture condensation severely restricting optical visibility on highways.',
      safetyTips: [
        'Use low-beam headlights and fog lights; do not use high-beams.',
        'Slow down and maintain ample following distance from leading vehicles.',
      ],
      urgency: 'Immediate',
      issuedFor: 'Low Visibility',
    });
  }

  // 8. Hazardous Air Quality Alert
  if (aqiData && aqiData.current && aqiData.current.us_aqi >= 151) {
    const aqi = Math.round(aqiData.current.us_aqi);
    alerts.push({
      id: 'air-quality-alert',
      severity: aqi >= 201 ? 'danger' : 'warning',
      category: 'Air Quality Action Alert',
      title: `Unhealthy Air Quality (AQI: ${aqi})`,
      description: `Particulate pollution levels exceed safe respiratory standards (PM2.5: ${aqiData.current.pm2_5 || 'elevated'} µg/m³).`,
      safetyTips: [
        'Avoid vigorous outdoor physical activity and exercise.',
        'Keep residential windows and doors closed.',
        'Consider wearing an N95 mask if heading outdoors.',
      ],
      urgency: 'Immediate',
      issuedFor: 'Air Pollution Index',
    });
  }

  return alerts;
}
