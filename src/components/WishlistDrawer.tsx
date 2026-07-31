import React from 'react';
import { Vehicle } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { getVehicleImages } from '../utils/vehicleUtils';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';

interface WishlistDrawerProps {
  vehicles: Vehicle[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveVehicle: (vehicle: Vehicle) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onPurchase: (id: string) => Promise<void>;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  vehicles,
  isOpen,
  onClose,
  onRemoveVehicle,
  onSelectVehicle,
  onPurchase,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`YOUR SAVED WISHLIST (${vehicles.length})`}
      maxWidth="max-w-3xl"
    >
      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border-3 border-[#0F1B2D]">
          <Heart className="w-16 h-16 text-red-400 mx-auto mb-3 stroke-[3px]" />
          <h3 className="text-xl font-black uppercase text-[#0F1B2D] mb-1">YOUR WISHLIST IS EMPTY</h3>
          <p className="text-xs font-extrabold uppercase text-neutral-500 max-w-sm mx-auto mb-4">
            Click the heart icon on any vehicle card to save your favorite luxury cars to this personal list.
          </p>
          <Button variant="yellow" onClick={onClose}>
            EXPLORE SHOWROOM
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {vehicles.map((v) => {
              const img = getVehicleImages(v)[0];
              return (
                <div
                  key={v.id}
                  className="border-3 border-[#0F1B2D] bg-white p-3 flex flex-col sm:flex-row items-center justify-between gap-4 brutal-shadow-sm hover:brutal-shadow transition-all"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="h-20 w-28 bg-black border-2 border-[#0F1B2D] flex-shrink-0 overflow-hidden">
                      <img src={img} alt={v.model} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="yellow">{v.category}</Badge>
                        <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500">
                          {v.year || 2024}
                        </span>
                      </div>
                      <div className="text-xs font-black uppercase text-neutral-500">{v.make}</div>
                      <h4 className="text-base font-black uppercase text-[#0F1B2D] leading-tight">{v.model}</h4>
                      <div className="text-sm font-black font-mono text-[#10B981] mt-0.5">
                        ${v.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="white"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onSelectVehicle(v);
                      }}
                      className="flex items-center gap-1"
                    >
                      VIEW
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                    </Button>

                    <Button
                      variant={v.quantity > 0 ? 'yellow' : 'white'}
                      disabled={v.quantity <= 0}
                      size="sm"
                      onClick={() => onPurchase(v.id)}
                      className="flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 stroke-[3px]" />
                      BUY
                    </Button>

                    <button
                      onClick={() => onRemoveVehicle(v)}
                      className="p-2 border-2 border-[#0F1B2D] bg-red-100 hover:bg-red-500 hover:text-white text-red-600 font-bold transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 stroke-[3px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};
