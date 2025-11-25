import { useToast } from '../../contexts/ToastContext.js';
import ToastItem from './ToastItem.js';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="flex flex-col items-end pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
}

