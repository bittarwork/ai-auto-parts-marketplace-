/**
 * Chart Wrapper
 * Consistent card container for all charts with title, subtitle, optional action, and loading state
 */
const ChartWrapper = ({ title, subtitle, children, loading, action }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {(title || action) && (
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-800">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="ml-3">{action}</div>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl animate-pulse">
          <div className="w-7 h-7 border-[3px] border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ChartWrapper;
