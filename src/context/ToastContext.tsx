import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../types';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-[#3B82F6] text-white'; // steel-blue for info
          let icon = <Info className="w-6 h-6 stroke-[3px]" />;

          if (toast.type === 'success') {
            bgColor = 'bg-[#10B981] text-white';
            icon = <CheckCircle className="w-6 h-6 stroke-[3px]" />;
          } else if (toast.type === 'error') {
            bgColor = 'bg-[#DC2626] text-white';
            icon = <AlertTriangle className="w-6 h-6 stroke-[3px]" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border-4 border-[#0F1B2D] shadow-[6px_6px_0px_#0F1B2D] p-4 ${bgColor} flex items-center justify-between gap-3 animate-none`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <span className="font-extrabold uppercase text-sm tracking-wide leading-tight">
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="border-2 border-white bg-transparent text-white p-1 hover:bg-white hover:text-[#0F1B2D] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
