import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const Icon = icons[type];

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg transition-all duration-300 ${colors[type]}`}>
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-2" />
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};