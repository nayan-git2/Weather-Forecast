import React from 'react';
import { DEFAULT_CITIES } from '../services/weatherApi';
import { Compass } from 'lucide-react';

export default function QuickCitiesBar({ currentCity, onSelectCity }) {
  return (
    <div className="w-full max-w-5xl mx-auto my-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 px-1 py-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Compass className="w-3.5 h-3.5 text-sky-400" /> Popular:
        </span>

        {DEFAULT_CITIES.map((city) => {
          const isSelected = currentCity?.name === city.name;
          return (
            <button
              key={city.id}
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/20 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
