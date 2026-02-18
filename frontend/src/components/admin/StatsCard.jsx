/**
 * Stats / KPI Card
 * Modern card with gradient icon background, value, label, and optional trend
 */

const palette = {
  blue:   { icon: 'from-blue-500 to-blue-600',    ring: 'ring-blue-100',   text: 'text-blue-600' },
  green:  { icon: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-100', text: 'text-emerald-600' },
  yellow: { icon: 'from-amber-400 to-amber-500',  ring: 'ring-amber-100',  text: 'text-amber-600' },
  purple: { icon: 'from-violet-500 to-violet-600', ring: 'ring-violet-100', text: 'text-violet-600' },
  red:    { icon: 'from-rose-500 to-rose-600',    ring: 'ring-rose-100',   text: 'text-rose-600' },
  indigo: { icon: 'from-indigo-500 to-indigo-600', ring: 'ring-indigo-100', text: 'text-indigo-600' },
};

const StatsCard = ({ title, value, icon: Icon, color = 'blue', trend, trendLabel, loading }) => {
  const p = palette[color] || palette.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-gray-100 rounded-full w-24" />
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-7 bg-gray-100 rounded-full w-28 mb-2.5" />
        <div className="h-3 bg-gray-100 rounded-full w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-none pt-1">
          {title}
        </p>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.icon} ring-4 ${p.ring} flex items-center justify-center shadow-sm flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>

      {/* Trend */}
      {(trend !== undefined || trendLabel) && (
        <div className="mt-2 flex items-center gap-1.5">
          {trend !== undefined && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
              trend >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
            }`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && (
            <span className="text-xs text-gray-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
