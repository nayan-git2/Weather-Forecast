/**
 * CARTO Basemaps configuration with authenticated API key.
 */

export const CARTO_API_KEY = 'cb1_4wv8_1_a9adb037a0b51ecfd9f4673b';

export function getCartoTileUrl(isDark = false) {
  const style = isDark ? 'dark_all' : 'rastertiles/voyager';
  return `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`;
}

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
