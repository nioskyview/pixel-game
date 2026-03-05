import React from 'react';
import { useAudio } from '../contexts/AudioContext';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  className?: string;
  isBlinking?: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  isBlinking = false,
  onMouseEnter,
  onClick,
  ...props
}) => {
  const { playHover, playClick } = useAudio();

  const getVariantColor = () => {
    switch (variant) {
      case 'secondary': return 'var(--secondary-color)';
      case 'danger': return 'var(--danger-color)';
      case 'success': return 'var(--success-color)';
      default: return 'var(--primary-color)';
    }
  };

  return (
    <button
      className={`pixel-button ${isBlinking ? 'blink' : ''} ${variant === 'success' || variant === 'danger' ? 'pop-effect' : ''} ${className}`}
      style={{ backgroundColor: getVariantColor() }}
      onMouseEnter={(e) => {
        playHover();
        if (onMouseEnter) onMouseEnter(e);
      }}
      onClick={(e) => {
        playClick();
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
};
