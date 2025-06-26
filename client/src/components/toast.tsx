import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow-lg animate-in slide-in-from-top-2">
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
