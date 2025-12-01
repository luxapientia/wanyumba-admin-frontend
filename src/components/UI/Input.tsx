import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      variant = 'default',
      inputSize = 'md',
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'block w-full rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      default: 'border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
      filled: 'border-2 border-transparent bg-gray-100 hover:bg-gray-150 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
      outlined: 'border-2 border-gray-300 bg-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-5 py-3 text-base sm:text-lg',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const paddingWithIcon = icon
      ? iconPosition === 'left'
        ? inputSize === 'sm'
          ? 'pl-9'
          : inputSize === 'lg'
          ? 'pl-12'
          : 'pl-10'
        : inputSize === 'sm'
        ? 'pr-9'
        : inputSize === 'lg'
        ? 'pr-12'
        : 'pr-10'
      : '';

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
      : '';

    const wrapperClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={`flex flex-col gap-1.5 min-w-0 ${wrapperClasses}`}>
        {/* Label */}
        {label && (
          <label className="text-sm font-semibold text-gray-700 px-1 truncate">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative flex-1 min-w-0">
          {/* Icon - Left */}
          {icon && iconPosition === 'left' && (
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex-shrink-0 ${iconSizes[inputSize]}`}
            >
              {icon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={`${baseClasses} ${variants[variant]} ${sizes[inputSize]} ${paddingWithIcon} ${errorClasses} ${className}`}
            disabled={disabled}
            {...(props as any)}
          />

          {/* Icon - Right or Error Icon */}
          {(icon && iconPosition === 'right') || error ? (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 flex-shrink-0 ${iconSizes[inputSize]} ${
                error ? 'text-red-500' : 'text-gray-400 pointer-events-none'
              }`}
            >
              {error ? <AlertCircle className={iconSizes[inputSize]} /> : icon}
            </div>
          ) : null}
        </div>

        {/* Helper Text or Error Message */}
        {(helperText || error) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs px-1 truncate ${
              error ? 'text-red-600 font-medium' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

