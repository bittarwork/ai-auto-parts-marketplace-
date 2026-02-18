import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Confirm Delete Modal
 * Modern centered dialog for destructive action confirmation
 */
const ConfirmDeleteModal = ({ isOpen, onConfirm, onCancel, title, message, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Close btn */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>

        {/* Icon + content */}
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-red-100">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-2">
            {title || 'Delete Confirmation'}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
