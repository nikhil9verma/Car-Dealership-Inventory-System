import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'blue' | 'red' | 'green' | 'black' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  // amber = primary action, steel-blue = info, crimson = danger, teal = success
  let colorClasses = 'bg-[#E8A020] text-[#0F1B2D] hover:bg-[#D4911A]';
  if (variant === 'blue') {
    colorClasses = 'bg-[#3B82F6] text-white hover:bg-[#2563EB]';
  } else if (variant === 'red') {
    colorClasses = 'bg-[#DC2626] text-white hover:bg-[#B91C1C]';
  } else if (variant === 'green') {
    colorClasses = 'bg-[#10B981] text-white hover:bg-[#059669]';
  } else if (variant === 'black') {
    colorClasses = 'bg-[#0F1B2D] text-white hover:bg-[#1E2F45]';
  } else if (variant === 'white') {
    colorClasses = 'bg-white text-[#0F1B2D] hover:bg-slate-100';
  }

  let sizeClasses = 'px-4 py-2 text-sm';
  if (size === 'sm') {
    sizeClasses = 'px-3 py-1.5 text-xs';
  } else if (size === 'lg') {
    sizeClasses = 'px-6 py-3 text-base';
  }

  return (
    <button
      disabled={disabled}
      className={`brutal-btn ${colorClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
