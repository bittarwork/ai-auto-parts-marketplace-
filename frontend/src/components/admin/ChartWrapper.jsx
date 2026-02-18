/**
 * Chart Wrapper
 * Container with title, loading state, and consistent styling for charts
 */
const ChartWrapper = ({ title, children, loading, action }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {action && <div>{action}</div>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ChartWrapper;
