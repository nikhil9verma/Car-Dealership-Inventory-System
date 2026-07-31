import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  vehicle: Vehicle | null;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vehicle,
}) => {
  const [loading, setLoading] = useState(false);

  if (!vehicle) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(vehicle.id);
      onClose();
    } catch (e) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CONFIRM DELETION">
      <div className="flex flex-col gap-5">
        <div className="bg-[#DC2626] text-white p-4 border-3 border-[#0F1B2D] flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 stroke-[3px] shrink-0" />
          <div className="font-black text-sm uppercase tracking-wide">
            PERMANENT DELETION WARNING! THIS ACTION CANNOT BE UNDONE.
          </div>
        </div>

        <div className="bg-slate-50 border-3 border-[#0F1B2D] p-4">
          <div className="text-xs font-black text-neutral-500 uppercase">
            TARGET VEHICLE:
          </div>
          <div className="text-xl font-black uppercase text-[#0F1B2D] mt-1">
            {vehicle.make} {vehicle.model}
          </div>
          <div className="text-sm font-bold font-mono text-neutral-600 mt-1">
            CATEGORY: {vehicle.category} | PRICE: ${vehicle.price.toLocaleString()} | STOCK: {vehicle.quantity}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t-3 border-[#0F1B2D]">
          <Button variant="white" onClick={onClose}>
            CANCEL
          </Button>
          <Button variant="red" onClick={handleDelete} disabled={loading}>
            {loading ? 'DELETING...' : 'DELETE VEHICLE'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
