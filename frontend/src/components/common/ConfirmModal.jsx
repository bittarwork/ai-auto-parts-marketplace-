import { Dialog } from '@headlessui/react';
import Button from './Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * ConfirmModal - Reusable confirmation dialog
 * Use instead of window.confirm() for better UX
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'neutral'
  loading = false
}) {
  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      onClose?.();
    } catch {
      // Parent handles error (toast) - keep modal open or let parent close
    }
  };

  const variantStyles = {
    danger: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
    neutral: 'bg-gray-100 dark:bg-dark-bg-secondary text-gray-600 dark:text-gray-400'
  };

  const buttonVariants = {
    danger: 'error',
    warning: 'primary',
    neutral: 'primary'
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-xl bg-white dark:bg-dark-bg p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-3 rounded-full ${variantStyles[variant]}`}>
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </Dialog.Title>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {message}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  {cancelLabel}
                </Button>
                <Button
                  variant={buttonVariants[variant]}
                  onClick={handleConfirm}
                  loading={loading}
                  disabled={loading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
