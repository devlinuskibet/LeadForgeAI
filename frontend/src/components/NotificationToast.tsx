import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface NotificationToastProps {
  message: string;
  type?: ToastType;
  durationMs?: number;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'info',
  durationMs = 4000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onClose]);

  const bgColors: Record<ToastType, string> = {
    success: '#064e3b',
    error: '#7f1d1d',
    info: '#1e3a8a'
  };

  const borderColors: Record<ToastType, string> = {
    success: '#059669',
    error: '#dc2626',
    info: '#2563eb'
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: bgColors[type],
        borderLeft: `4px solid ${borderColors[type]}`,
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '6px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        fontFamily: 'sans-serif',
        fontSize: '0.875rem'
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#cbd5e1',
          cursor: 'pointer',
          fontSize: '1rem',
          lineHeight: 1
        }}
      >
        &times;
      </button>
    </div>
  );
};

export default NotificationToast;
