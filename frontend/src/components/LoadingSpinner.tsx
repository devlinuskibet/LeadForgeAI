import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  label = 'Loading...'
}) => {
  const dimensions = size === 'small' ? 18 : size === 'large' ? 42 : 28;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        color: '#94a3b8',
        fontFamily: 'sans-serif',
        fontSize: '0.875rem'
      }}
    >
      <svg
        width={dimensions}
        height={dimensions}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'spin 1s linear infinite'
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeOpacity="0.25"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12C2 14.2381 2.73558 16.3045 3.97828 17.971"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && <span>{label}</span>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
