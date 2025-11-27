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
        'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 focus:ring-indigo-500/50 active:scale-95',
      secondary:
        'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 focus:ring-purple-500/50 active:scale-95',
      outline:
        'border-2 border-indigo-500 text-indigo-600 bg-transparent hover:bg-indigo-50 focus:ring-indigo-500/50 active:scale-95',
      ghost:
        'text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500/50 active:scale-95',
      danger:
        'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/50 focus:ring-red-500/50 active:scale-95',
      success:
        'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50 focus:ring-green-500/50 active:scale-95',
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
        onAnimationStart,
        onDrag,
        onDragStart,
        onDragEnd,
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

