import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="font-extrabold uppercase text-xs tracking-wider text-black">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`brutal-input ${error ? 'border-[#FF3B30] bg-[#FFF0F0]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[#FF3B30] font-bold text-xs uppercase mt-0.5 tracking-tight">
          {error}
        </span>
      )}
    </div>
  );
};
