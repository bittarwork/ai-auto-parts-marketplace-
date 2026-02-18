import clsx from 'clsx';

/**
 * Reusable Card Component
 * Container with consistent styling
 */
export default function Card({
  children,
  hover = false,
  compact = false,
  noPadding = false,
  className = '',
  ...props
}) {
  const classes = clsx(
    'card',
    hover && 'card-hover',
    compact && 'card-compact',
    noPadding && 'p-0',
    className
  );
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Header Component
 */
export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={clsx('flex items-start justify-between mb-4', className)}>
      <div>
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Card Body Component
 */
export function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

/**
 * Card Footer Component
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-gray-200 dark:border-dark-border', className)}>
      {children}
    </div>
  );
}
