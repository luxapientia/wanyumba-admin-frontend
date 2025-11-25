import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import Button from '../UI/Button.js';
import type { Toast } from '../../contexts/ToastContext.js';

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export default function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation before removal
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300); // Start exit animation 300ms before removal

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-red-500 shadow-lg';
      case 'warning':
        return 'bg-white border-l-4 border-amber-500 shadow-lg';
      case 'info':
        return 'bg-white border-l-4 border-blue-500 shadow-lg';
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
        return 'text-blue-500';
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`min-w-[320px] max-w-md rounded-xl ${getStyles()} mb-3 overflow-hidden`}
        >
          <div className="p-4 flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${getIconColor()}`}>
              {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>

            {/* Close button */}
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 p-1"
              aria-label="Close"
            >
              <X size={16} className="text-gray-400" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <motion.div
              className={`h-full ${
                toast.type === 'success'
                  ? 'bg-green-500'
                  : toast.type === 'error'
                  ? 'bg-red-500'
                  : toast.type === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

