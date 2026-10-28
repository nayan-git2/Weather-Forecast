import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  CloudLightning,
  Wind,
  Droplets,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function AlertBanner({ alerts = [], isDark = false }) {
  const [expandedId, setExpandedId] = useState(null);
  const [dismissedIds, setDismissedIds] = useState([]);

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  if (!alerts || alerts.length === 0) {
    return (
      <div className={`w-full max-w-7xl mx-auto mb-6 px-5 py-4 rounded-2xl border-2 backdrop-blur-xl flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs transition-colors ${
        isDark
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          : 'bg-emerald-50 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span>
            <strong>Atmospheric Status Normal:</strong> Meteorological parameters and air quality are currently within safe operational limits for this region.
          </span>
        </div>
        <span className="text-emerald-800 dark:text-emerald-400 font-mono text-xs hidden sm:inline font-extrabold">
          Live Sensor Telemetry
        </span>
      </div>
    );
  }

  if (activeAlerts.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-4 text-center">
        <button
          onClick={() => setDismissedIds([])}
          className="text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
        >
          View {alerts.length} dismissed weather alert{alerts.length > 1 ? 's' : ''}
        </button>
      </div>
    );
  }

  const getAlertIcon = (id) => {
    if (id.includes('heat')) return <Flame className="w-5 h-5 stroke-[2.5]" />;
    if (id.includes('thunderstorm')) return <CloudLightning className="w-5 h-5 stroke-[2.5]" />;
    if (id.includes('wind')) return <Wind className="w-5 h-5 stroke-[2.5]" />;
    if (id.includes('rain') || id.includes('flood')) return <Droplets className="w-5 h-5 stroke-[2.5]" />;
    return <AlertTriangle className="w-5 h-5 stroke-[2.5]" />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto mb-6 space-y-4">
      {activeAlerts.map((alert) => {
        const isExpanded = expandedId === alert.id;
        const isDanger = alert.severity === 'danger';

        return (
          <section
            key={alert.id}
            className={`relative w-full rounded-3xl border-2 backdrop-blur-xl p-5 sm:p-6 shadow-md overflow-hidden transition-all ${
              isDanger
                ? isDark
                  ? 'bg-rose-950/50 border-rose-500/50 text-rose-100'
                  : 'bg-rose-50 border-rose-300 text-slate-950'
                : isDark
                ? 'bg-amber-950/50 border-amber-500/50 text-amber-100'
                : 'bg-amber-50 border-amber-300 text-slate-950'
            }`}
          >
            {/* Left Multi-Color Gradient Bar (Stitch Signature) */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-rose-500 via-amber-500 to-sky-500" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pl-3">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                  isDanger
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}>
                  {getAlertIcon(alert.id)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      isDanger
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-amber-400 text-slate-950 shadow-2xs'
                    }`}>
                      {alert.severity === 'danger' ? 'High Risk Hazard' : 'Moderate Advisory'}
                    </span>
                    <h4 className="font-space font-extrabold text-lg sm:text-xl text-slate-950 dark:text-white">
                      {alert.title}
                    </h4>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono hidden sm:inline">
                      • Urgency: {alert.urgency || 'Immediate'}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium max-w-4xl leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  className={`px-4 py-2 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer btn-interactive ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-white'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-950'
                  }`}
                >
                  <span>{isExpanded ? 'Hide Safety Protocol' : 'View Safety Protocol'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
                </button>

                <button
                  onClick={() => setDismissedIds((prev) => [...prev, alert.id])}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Expandable Protocol Grid */}
            {isExpanded && alert.safetyTips && (
              <div className="mt-5 pt-4 border-t-2 border-slate-300 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3.5 pl-3">
                <div className={`p-4 rounded-2xl border-2 shadow-xs ${
                  isDark ? 'bg-slate-900 border-rose-900/60' : 'bg-white border-rose-200'
                }`}>
                  <span className="text-xs uppercase font-black tracking-wider text-rose-700 dark:text-rose-400 block mb-1.5">
                    Precautionary Action
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 leading-snug block">
                    {alert.safetyTips[0] || 'Remain aware of localized updates.'}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border-2 shadow-xs ${
                  isDark ? 'bg-slate-900 border-amber-900/60' : 'bg-white border-amber-200'
                }`}>
                  <span className="text-xs uppercase font-black tracking-wider text-amber-700 dark:text-amber-400 block mb-1.5">
                    Environmental Hazard
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 leading-snug block">
                    {alert.safetyTips[1] || 'Limit prolonged outdoor exposure.'}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border-2 shadow-xs ${
                  isDark ? 'bg-slate-900 border-sky-900/60' : 'bg-white border-sky-200'
                }`}>
                  <span className="text-xs uppercase font-black tracking-wider text-sky-700 dark:text-sky-400 block mb-1.5">
                    Station Recommendation
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 leading-snug block">
                    {alert.safetyTips[2] || 'Monitor live Doppler radar for developments.'}
                  </span>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
