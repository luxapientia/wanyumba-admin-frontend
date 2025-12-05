import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'button' | 'a' | 'link';
  href?: string;
  to?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      as = 'button',
      href,
      to,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

    const variants = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500/50 active:scale-95 shadow-sm hover:shadow-md',
      secondary:
        'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500/50 active:scale-95 shadow-sm hover:shadow-md',
      outline:
        'border-2 border-indigo-500 text-indigo-600 bg-transparent hover:bg-indigo-50 focus:ring-indigo-500/50 active:scale-95',
      ghost:
        'text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500/50 active:scale-95',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50 active:scale-95 shadow-sm hover:shadow-md',
      success:
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50 active:scale-95 shadow-sm hover:shadow-md',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

    const content = (
      <>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span className={loading ? 'opacity-0' : ''}>{children}</span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </>
    );

    if (as === 'link' && to) {
      return (
        <motion.div
          whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        >
          <Link to={to} className={classes}>
            {content}
          </Link>
        </motion.div>
      );
    }

    if (as === 'a' && href) {
      const {
        onAnimationStart: _onAnimationStart,
        onDrag: _onDrag,
        onDragStart: _onDragStart,
        onDragEnd: _onDragEnd,
        ...anchorProps
      } = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <motion.a
          href={href}
          className={classes}
          whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
          {...anchorProps}
        >
          {content}
        </motion.a>
      );
    }

    const buttonProps = props;
    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...buttonProps}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

