import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button.js';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
  maxHeight?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  full: 'max-w-7xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '',
  maxHeight = 'max-h-[90vh]',
}: ModalProps) {
  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnBackdropClick) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnBackdropClick, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${closeOnBackdropClick ? 'cursor-pointer' : ''}`}
          />

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full pointer-events-auto border border-gray-200/50 overflow-hidden ${maxHeight} flex flex-col ${className}`}
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />

              {/* Close button - Enhanced UX */}
              {showCloseButton && (
                <motion.button
                  onClick={onClose}
                  className="absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-gray-100 active:bg-gray-200 border border-gray-200/50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2"
                  aria-label="Close modal"
                  title="Close (ESC)"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <X 
                    size={18} 
                    className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200" 
                    strokeWidth={2.5}
                  />
                </motion.button>
              )}

              {/* Title */}
              {title && (
                <div className={`px-6 pt-6 pb-4 border-b border-gray-200 ${showCloseButton ? 'pr-16' : ''}`}>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h3>
                </div>
              )}

              {/* Content */}
              <div className={`p-6 sm:p-8 overflow-y-auto flex-1 ${!title && 'pt-6'}`}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

