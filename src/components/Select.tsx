import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', id, ...props }) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={selectId} className="font-extrabold uppercase text-xs tracking-wider text-black">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`brutal-input uppercase font-bold text-sm cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="font-bold py-1 uppercase">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-[#FF3B30] font-bold text-xs uppercase mt-0.5 tracking-tight">
          {error}
        </span>
      )}
    </div>
  );
};
