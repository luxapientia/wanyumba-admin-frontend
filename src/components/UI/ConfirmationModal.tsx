import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from './Button.js';
import Modal from './Modal.js';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  children,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmButton: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      confirmButton: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmButton: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
    },
  };

  const styles = variantStyles[variant];

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-3">
      {/* Cancel Button */}
      <Button
        type="button"
        onClick={onClose}
        disabled={loading}
        variant="outline"
        fullWidth
        className="flex-1"
      >
        {cancelText}
      </Button>
      
      {/* Confirm Button */}
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        loading={loading}
        variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary'}
        fullWidth
        className={`flex-1 ${styles.confirmButton}`}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      maxHeight="max-h-[95vh]"
      footer={footer}
    >
      {/* Icon */}
      <div className="flex justify-center mb-5">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={`p-4 ${styles.iconBg} rounded-full shadow-lg`}
        >
          <AlertTriangle size={36} className={styles.iconColor} />
        </motion.div>
      </div>

      {/* Title */}
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
        {title}
      </h3>

      {/* Message */}
      <p className="text-gray-600 text-center mb-6 leading-relaxed text-base sm:text-lg">
        {message}
      </p>

      {/* Additional Content (e.g., form fields) */}
      {children && (
        <div className="mb-6">
          {children}
        </div>
      )}
    </Modal>
  );
}

