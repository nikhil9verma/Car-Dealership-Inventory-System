import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, maxWidth = 'max-w-lg', children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-none overflow-y-auto">
      <div className={`brutal-card bg-[#F8F9FA] w-full ${maxWidth} max-h-[92vh] flex flex-col p-0 brutal-shadow-xl border-4 border-[#0F1B2D] relative my-auto overflow-hidden`}>
        {/* Modal Header */}
        <div className="bg-[#FFE500] border-b-4 border-[#0F1B2D] p-3 sm:p-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#0F1B2D] truncate pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="border-3 border-[#0F1B2D] bg-white p-1 hover:bg-[#0F1B2D] hover:text-[#FFE500] transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[3px]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
