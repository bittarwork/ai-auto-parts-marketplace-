import { useEffect } from 'react';
import clsx from 'clsx';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Alert Component
 * For displaying notifications and messages
 */
export default function Alert({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  autoClose = false,
  autoCloseDelay = 5000,
  className = '',
}) {
  const typeConfig = {
    success: {
      class: 'alert-success',
      icon: CheckCircleIcon,
    },
    error: {
      class: 'alert-error',
      icon: ExclamationCircleIcon,
    },
    warning: {
      class: 'alert-warning',
      icon: ExclamationTriangleIcon,
    },
    info: {
      class: 'alert-info',
      icon: InformationCircleIcon,
    },
  };
  
  const config = typeConfig[type];
  const Icon = config.icon;
  
  useEffect(() => {
    if (autoClose && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onDismiss]);
  
  return (
    <div className={clsx('alert', config.class, className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          {message && <p className="text-sm">{message}</p>}
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
