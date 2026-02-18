import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Reusable Input Component
 * Supports various types, icons, and states
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const inputClasses = clsx(
    'input',
    error && 'input-error',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    fullWidth && 'w-full',
    className
  );
  
  return (
    <div className={clsx('form-group', containerClassName)}>
      {label && (
        <label className="label">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && <p className="error-message">{error}</p>}
      {!error && helperText && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
