import React, { useMemo } from 'react';

export default function WeatherBackground({ weatherType = 'clear', isDay = 1, isDark = false }) {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.3 + 3) % 100}%`,
      animationDuration: `${1.5 + (i % 5) * 0.4}s`,
      animationDelay: `${(i % 10) * 0.2}s`,
      opacity: 0.35 + (i % 6) * 0.1,
      size: `${2 + (i % 4) * 2}px`,
    }));
  }, []);

  const darkGradient = useMemo(() => {
    if (!isDay) {
      return 'from-slate-950 via-[#0b132b] to-[#1c2541]';
    }
    switch (weatherType) {
      case 'rain':
        return 'from-[#0f1d38] via-[#102444] to-[#0a1128]';
      case 'thunderstorm':
        return 'from-[#17102e] via-[#1e1338] to-[#0a0618]';
      case 'snow':
        return 'from-[#132338] via-[#182f4d] to-[#0d1726]';
      default:
        return 'from-slate-950 via-slate-900 to-[#0f172a]';
    }
  }, [weatherType, isDay]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* 1. BRIGHT DAYLIGHT LAYER (Smoothly cross-fades via opacity) */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-slate-50 via-sky-50/70 to-blue-50/50 transition-opacity duration-700 ease-in-out ${
          isDark ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Daylight Morning Glow Orbs */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-sky-200/40 rounded-full blur-[140px] transition-transform duration-1000 ease-out transform-gpu" />
        <div className="absolute top-80 right-10 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-[130px] transition-transform duration-1000 ease-out transform-gpu" />
        <div className="absolute bottom-40 left-10 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[150px] transition-transform duration-1000 ease-out transform-gpu" />

        {/* Rain in Light Mode */}
        {weatherType === 'rain' && (
          <div className="absolute inset-0">
            {particles.map((p) => (
              <div
                key={`light-rain-${p.id}`}
                className="absolute top-0 w-0.5 bg-gradient-to-b from-transparent to-sky-600/40 rounded-full animate-fall"
                style={{
                  left: p.left,
                  height: `${24 + parseInt(p.size) * 8}px`,
                  animationDuration: p.animationDuration,
                  animationDelay: p.animationDelay,
                  opacity: p.opacity,
                }}
              />
            ))}
          </div>
        )}

        {/* Snow in Light Mode */}
        {weatherType === 'snow' && (
          <div className="absolute inset-0">
            {particles.map((p) => (
              <div
                key={`light-snow-${p.id}`}
                className="absolute top-0 rounded-full bg-sky-400/60 animate-snow"
                style={{
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  animationDuration: `${3 + (p.id % 4) * 1.5}s`,
                  animationDelay: p.animationDelay,
                  opacity: p.opacity,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. DARK MIDNIGHT LAYER (Smoothly cross-fades via opacity) */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${darkGradient} transition-opacity duration-700 ease-in-out ${
          isDark ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl transition-transform duration-1000 ease-out transform-gpu" />
        <div className="absolute top-80 left-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl transition-transform duration-1000 ease-out transform-gpu" />

        {weatherType === 'thunderstorm' && (
          <div className="absolute inset-0 bg-indigo-400/5 animate-pulse duration-700" />
        )}

        {/* Rain in Dark Mode */}
        {weatherType === 'rain' && (
          <div className="absolute inset-0">
            {particles.map((p) => (
              <div
                key={`dark-rain-${p.id}`}
                className="absolute top-0 w-0.5 bg-gradient-to-b from-transparent to-sky-300/40 rounded-full animate-fall"
                style={{
                  left: p.left,
                  height: `${24 + parseInt(p.size) * 8}px`,
                  animationDuration: p.animationDuration,
                  animationDelay: p.animationDelay,
                  opacity: p.opacity,
                }}
              />
            ))}
          </div>
        )}

        {/* Snow in Dark Mode */}
        {weatherType === 'snow' && (
          <div className="absolute inset-0">
            {particles.map((p) => (
              <div
                key={`dark-snow-${p.id}`}
                className="absolute top-0 rounded-full bg-white/70 animate-snow"
                style={{
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  animationDuration: `${3 + (p.id % 4) * 1.5}s`,
                  animationDelay: p.animationDelay,
                  opacity: p.opacity,
                }}
              />
            ))}
          </div>
        )}

        {/* Twinkling Stars in Dark Mode */}
        {!isDay && (
          <div className="absolute inset-0">
            {particles.slice(0, 16).map((p) => (
              <div
                key={`star-${p.id}`}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  left: p.left,
                  top: `${(p.id * 7) % 65}%`,
                  width: `${1.5 + (p.id % 2)}px`,
                  height: `${1.5 + (p.id % 2)}px`,
                  animationDuration: `${2 + (p.id % 3)}s`,
                  opacity: 0.2 + (p.id % 4) * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-40px); }
          100% { transform: translateY(110vh); }
        }
        @keyframes snow {
          0% { transform: translateY(-20px) translateX(0); }
          50% { transform: translateY(50vh) translateX(15px); }
          100% { transform: translateY(110vh) translateX(-10px); }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        .animate-snow {
          animation: snow linear infinite;
        }
      `}</style>
    </div>
  );
}
