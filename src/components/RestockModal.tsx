import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Plus, Minus } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestock: (id: string, quantity: number) => Promise<void>;
  vehicle: Vehicle | null;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  onRestock,
  vehicle,
}) => {
  const [quantity, setQuantity] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setLoading(true);
    try {
      await onRestock(vehicle.id, quantity);
      onClose();
    } catch (e) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="RESTOCK VEHICLE INVENTORY">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="bg-[#00E676] border-3 border-black p-4 text-black font-black uppercase text-sm">
          CURRENT STOCK LEVEL: <span className="font-mono text-xl">{vehicle.quantity}</span> UNITS
        </div>

        <div className="bg-[#F5F0E8] border-3 border-black p-3">
          <div className="text-xs font-black uppercase text-neutral-600">
            VEHICLE:
          </div>
          <div className="text-lg font-black uppercase text-black">
            {vehicle.make} {vehicle.model}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-extrabold uppercase text-xs tracking-wider text-black">
            ADD QUANTITY UNITS:
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="border-3 border-black bg-white hover:bg-black hover:text-white p-3 font-black text-xl brutal-shadow cursor-pointer"
            >
              <Minus className="w-5 h-5 stroke-[3px]" />
            </button>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center font-mono text-xl"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="border-3 border-black bg-white hover:bg-black hover:text-white p-3 font-black text-xl brutal-shadow cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3px]" />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t-3 border-black">
          <Button type="button" variant="white" onClick={onClose}>
            CANCEL
          </Button>
          <Button type="submit" variant="green" disabled={loading}>
            {loading ? 'RESTOCKING...' : `ADD +${quantity} UNITS`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
