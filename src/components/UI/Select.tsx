import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<HTMLMotionProps<'select'>, 'size' | 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  selectSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'Select an option',
      variant = 'default',
      selectSize = 'md',
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'block w-full rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer';

    const variants = {
      default: 'border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
      filled: 'border-2 border-transparent bg-gray-100 hover:bg-gray-150 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
      outlined: 'border-2 border-gray-300 bg-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
    };

    const sizes = {
      sm: 'px-3 py-2 pr-9 text-sm',
      md: 'px-4 py-2.5 pr-10 text-base',
      lg: 'px-5 py-3 pr-12 text-base sm:text-lg',
    };

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
      : '';

    const wrapperClasses = fullWidth ? 'w-full' : '';

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className={`flex flex-col gap-1.5 min-w-0 ${wrapperClasses}`}>
        {/* Label */}
        {label && (
          <label className="text-sm font-semibold text-gray-700 px-1 truncate">
            {label}
          </label>
        )}

        {/* Select Container */}
        <div className="relative flex-1 min-w-0">
          {/* Select Field */}
          <motion.select
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={`${baseClasses} ${variants[variant]} ${sizes[selectSize]} ${errorClasses} ${className}`}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </motion.select>

          {/* Chevron Icon or Error Icon */}
          <div
            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex-shrink-0 ${
              error ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {error ? (
              <AlertCircle className={iconSizes[selectSize]} />
            ) : (
              <ChevronDown className={iconSizes[selectSize]} />
            )}
          </div>
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

Select.displayName = 'Select';

export default Select;

