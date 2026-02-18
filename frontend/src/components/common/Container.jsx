import clsx from 'clsx';

/**
 * Container Component
 * Responsive max-width container
 */
export default function Container({ children, size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    lg: 'max-w-[1400px]',
    full: 'max-w-full',
  };
  
  return (
    <div className={clsx(sizeClasses[size], 'mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
