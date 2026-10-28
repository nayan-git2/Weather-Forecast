import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Wind,
} from 'lucide-react';

export default function WeatherIcon({ name, className = 'w-8 h-8', isDay = 1 }) {
  switch (name) {
    case 'Sun':
      return <Sun className={`${className} text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]`} />;
    case 'Moon':
      return <Moon className={`${className} text-indigo-200 drop-shadow-[0_0_10px_rgba(199,210,254,0.4)]`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.4)]`} />;
    case 'CloudMoon':
      return <CloudMoon className={`${className} text-blue-200 drop-shadow-[0_0_8px_rgba(191,219,254,0.3)]`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-300 drop-shadow-[0_2px_8px_rgba(148,163,184,0.3)]`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-400`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-sky-400`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.4)]`} />;
    case 'Snowflake':
    case 'CloudSnow':
      return <Snowflake className={`${className} text-cyan-200 drop-shadow-[0_0_10px_rgba(165,243,252,0.5)]`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-yellow-300 drop-shadow-[0_0_14px_rgba(253,224,71,0.6)] animate-pulse`} />;
    case 'Wind':
      return <Wind className={`${className} text-teal-300`} />;
    default:
      return isDay ? (
        <Sun className={`${className} text-amber-400`} />
      ) : (
        <Moon className={`${className} text-indigo-300`} />
      );
  }
}
