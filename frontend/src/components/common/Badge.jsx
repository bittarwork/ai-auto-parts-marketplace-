import clsx from 'clsx';

/**
 * Badge Component
 * Small status indicators
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    secondary: 'badge-secondary',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: '',
    lg: 'text-sm px-3 py-1',
  };
  
  const classes = clsx(
    'badge',
    variantClasses[variant],
    sizeClasses[size],
    className
  );
  
  return (
    <span className={classes}>
      {dot && (
        <span className={clsx(
          'inline-block w-1.5 h-1.5 rounded-full mr-1.5',
          variant === 'success' && 'bg-success-500',
          variant === 'warning' && 'bg-warning-500',
          variant === 'error' && 'bg-error-500',
          variant === 'primary' && 'bg-primary-500',
          variant === 'secondary' && 'bg-gray-500'
        )}></span>
      )}
      {children}
    </span>
  );
}
