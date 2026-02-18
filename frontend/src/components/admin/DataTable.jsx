import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Reusable Data Table
 * Clean, modern table with sortable columns, loading skeletons, empty states, and pagination
 */

const DataTable = ({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
  emptyMessage = 'No data found',
  emptyIcon
}) => {
  const handleSort = (key) => {
    if (!onSort) return;
    onSort(key, sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Visible page numbers (window of 5 around current)
  const getPages = () => {
    if (!pagination) return [];
    const { page, pages } = pagination;
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(pages, page + delta);
      i++
    ) range.push(i);
    return range;
  };

  return (
    <div className="space-y-3">
      {/* Table wrapper */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Head */}
            <thead>
              <tr className="border-b border-gray-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`
                      px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider
                      select-none bg-gray-50/60
                      ${col.sortable ? 'cursor-pointer hover:text-gray-600 transition-colors' : ''}
                      ${col.className || ''}
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {typeof col.label === 'string' ? col.label : col.label}
                      {col.sortable && (
                        sortBy === col.key
                          ? sortOrder === 'asc'
                            ? <ChevronUpIcon className="w-3.5 h-3.5 text-blue-500" />
                            : <ChevronDownIcon className="w-3.5 h-3.5 text-blue-500" />
                          : <ChevronUpDownIcon className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 animate-pulse">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <div
                          className="h-3.5 bg-gray-100 rounded-full"
                          style={{ width: `${50 + Math.random() * 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      {emptyIcon ? (
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                          {emptyIcon}
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                          <span className="text-2xl">🔍</span>
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={row._id || rowIndex}
                    className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors duration-100"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-sm text-gray-700 ${col.cellClassName || ''}`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-1">
          {/* Info */}
          <p className="text-xs text-gray-400">
            Showing{' '}
            <span className="font-medium text-gray-600">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-600">{pagination.total}</span>
          </p>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="h-8 px-3 text-xs font-medium rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {getPages().map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-8 w-8 text-xs font-semibold rounded-xl transition-colors ${
                  pagination.page === p
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="h-8 px-3 text-xs font-medium rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
