import { useState, useCallback } from 'react';
import { ToastMessage } from '../components';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastMessage['type'] = 'info',
    options?: Partial<Pick<ToastMessage, 'autoClose' | 'duration'>>
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = {
      id,
      message,
      type,
      autoClose: type !== 'error',
      duration: type === 'success' ? 3000 : type === 'warning' ? 5000 : type === 'error' ? 0 : 3000,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const showSuccess = useCallback((message: string, options?: Partial<Pick<ToastMessage, 'autoClose' | 'duration'>>) => {
    return showToast(message, 'success', options);
  }, [showToast]);

  const showError = useCallback((message: string, options?: Partial<Pick<ToastMessage, 'autoClose' | 'duration'>>) => {
    return showToast(message, 'error', { autoClose: false, ...options });
  }, [showToast]);

  const showInfo = useCallback((message: string, options?: Partial<Pick<ToastMessage, 'autoClose' | 'duration'>>) => {
    return showToast(message, 'info', options);
  }, [showToast]);

  const showWarning = useCallback((message: string, options?: Partial<Pick<ToastMessage, 'autoClose' | 'duration'>>) => {
    return showToast(message, 'warning', options);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
    clearToasts,
  };
};