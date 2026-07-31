import React from 'react';
import { Vehicle } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { getVehicleImages } from '../utils/vehicleUtils';
import { Scale, Trash2, ShoppingCart, Zap, Fuel, Settings, Check } from 'lucide-react';

interface CompareModalProps {
  vehicles: Vehicle[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveVehicle: (id: string) => void;
  onClearAll: () => void;
  onPurchase: (id: string) => Promise<void>;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  vehicles,
  isOpen,
  onClose,
  onRemoveVehicle,
  onClearAll,
  onPurchase,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`VEHICLE COMPARISON MATRIX (${vehicles.length}/3)`}
      maxWidth="max-w-6xl"
    >
      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border-3 border-[#0F1B2D]">
          <Scale className="w-16 h-16 text-neutral-400 mx-auto mb-3 stroke-[3px]" />
          <h3 className="text-xl font-black uppercase text-[#0F1B2D] mb-1">NO VEHICLES SELECTED FOR COMPARISON</h3>
          <p className="text-xs font-extrabold uppercase text-neutral-500 max-w-sm mx-auto mb-4">
            Click the "Compare" button on any vehicle card in the showroom to add up to 3 cars side-by-side.
          </p>
          <Button variant="yellow" onClick={onClose}>
            BACK TO SHOWROOM
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-slate-100 border-2 border-[#0F1B2D] p-3">
            <span className="text-xs font-black uppercase text-[#0F1B2D]">
              COMPARING {vehicles.length} VEHICLES SIDE BY SIDE
            </span>
            <Button variant="white" size="sm" onClick={onClearAll}>
              CLEAR ALL COMPARISONS
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-3 border-[#0F1B2D] text-left">
              <thead>
                <tr className="bg-[#0F1B2D] text-white">
                  <th className="p-3 border-2 border-[#0F1B2D] text-xs font-black uppercase w-48 bg-[#0F1B2D]">
                    SPECIFICATION
                  </th>
                  {vehicles.map((v) => (
                    <th key={v.id} className="p-3 border-2 border-[#0F1B2D] text-center min-w-[220px]">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="yellow">{v.category}</Badge>
                        <button
                          onClick={() => onRemoveVehicle(v.id)}
                          className="text-red-400 hover:text-red-200 cursor-pointer p-1"
                          title="Remove from compare"
                        >
                          <Trash2 className="w-4 h-4 stroke-[3px]" />
                        </button>
                      </div>
                      <div className="h-32 bg-black mb-2 border border-slate-700 overflow-hidden">
                        <img
                          src={getVehicleImages(v)[0]}
                          alt={v.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs font-black uppercase text-slate-300">{v.make}</div>
                      <div className="text-lg font-black uppercase text-white truncate">{v.model}</div>
                      <div className="text-sm font-black font-mono text-[#10B981] mt-1">
                        ${v.price.toLocaleString()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white font-mono text-xs text-[#0F1B2D]">
                <tr className="border-b-2 border-[#0F1B2D]">
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">YEAR / MODEL YEAR</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D] font-black">{v.year || 2024}</td>
                  ))}
                </tr>
                <tr className="border-b-2 border-[#0F1B2D]">
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">ENGINE POWER (HP)</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D] font-black text-[#E8A020]">
                      {v.horsepower || 350} HP
                    </td>
                  ))}
                </tr>
                <tr className="border-b-2 border-[#0F1B2D]">
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">ENGINE TYPE</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D]">{v.engineType || 'V6 Turbo'}</td>
                  ))}
                </tr>
                <tr className="border-b-2 border-[#0F1B2D]">
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">FUEL TYPE</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D]">
                      <span className="font-bold uppercase text-[#10B981]">{v.fuelType || 'Gasoline'}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b-2 border-[#0F1B2D]">
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">TRANSMISSION</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D]">{v.transmission || 'Automatic'}</td>
                  ))}
                </tr>
                <tr className="border-b-2 border-[#0F1B2D]">
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">DRIVETRAIN</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D] font-bold">{v.drivetrain || 'AWD'}</td>
                  ))}
                </tr>
                <tr className="border-b-2 border-[#0F1B2D]">
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">CONDITION</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D] font-extrabold">{v.condition || 'New'}</td>
                  ))}
                </tr>
                <tr className="border-b-2 border-[#0F1B2D]">
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">STOCK STATUS</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D]">
                      <Badge variant={v.quantity > 0 ? 'green' : 'red'}>
                        {v.quantity > 0 ? `${v.quantity} AVAILABLE` : 'SOLD OUT'}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-extrabold uppercase bg-slate-100 border-r-2 border-[#0F1B2D]">ACTION</td>
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-3 text-center border-r-2 border-[#0F1B2D]">
                      <Button
                        variant={v.quantity > 0 ? 'yellow' : 'white'}
                        disabled={v.quantity <= 0}
                        size="sm"
                        onClick={() => onPurchase(v.id)}
                        className="w-full flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 stroke-[3px]" />
                        BUY NOW
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
};
