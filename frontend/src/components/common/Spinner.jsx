import clsx from 'clsx';

/**
 * Loading Spinner Component
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  return (
    <div className={clsx('spinner', sizeClasses[size], className)}></div>
  );
}

/**
 * Loading Screen Component
 */
export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline Loader Component
 */
export function InlineLoader({ text = '' }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Spinner size="md" />
      {text && <span className="ml-3 text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
}
