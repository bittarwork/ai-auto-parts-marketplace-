import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

/**
 * Stats / KPI Card
 * Displays a metric with optional trend indicator
 */
const StatsCard = ({ title, value, icon: Icon, color = 'blue', trend, trendLabel, loading }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-3 flex items-center gap-1">
          {trend !== undefined && (
            <>
              {trend >= 0 ? (
                <ArrowUpIcon className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <ArrowDownIcon className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
            </>
          )}
          {trendLabel && (
            <span className="text-xs text-gray-400 ml-1">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
