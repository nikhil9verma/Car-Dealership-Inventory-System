import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'blue' | 'red' | 'green' | 'black' | 'white';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'yellow', className = '' }) => {
  let bg = 'bg-[#E8A020] text-[#0F1B2D]';
  if (variant === 'blue') bg = 'bg-[#3B82F6] text-white';
  if (variant === 'red') bg = 'bg-[#DC2626] text-white';
  if (variant === 'green') bg = 'bg-[#10B981] text-white';
  if (variant === 'black') bg = 'bg-[#0F1B2D] text-white';
  if (variant === 'white') bg = 'bg-white text-[#0F1B2D]';

  return (
    <span className={`inline-block border-2 border-[#0F1B2D] px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${bg} ${className}`}>
      {children}
    </span>
  );
};
