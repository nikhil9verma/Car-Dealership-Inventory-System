import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Button } from './Button';
import { Badge } from './Badge';
import { ShoppingCart, Edit, Trash2, PlusCircle, Heart, Scale, Eye, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getVehicleImages, getVehicleTags, DEFAULT_VEHICLE_IMAGE } from '../utils/vehicleUtils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: string) => Promise<void>;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (vehicle: Vehicle) => void;
  isCompared?: boolean;
  onToggleCompare?: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPurchase,
  onSelectVehicle,
  onEdit,
  onDelete,
  onRestock,
  isWishlisted = false,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
}) => {
  const { isAdmin } = useAuth();
  const [purchasing, setPurchasing] = useState(false);

  const isSoldOut = vehicle.quantity <= 0;
  const images = getVehicleImages(vehicle);
  const tags = getVehicleTags(vehicle);

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut || purchasing) return;
    setPurchasing(true);
    try {
      await onPurchase(vehicle.id);
    } catch (err: any) {
      // Handled by parent toast
    } finally {
      setPurchasing(false);
    }
  };

  const getCategoryVariant = (cat: string) => {
    const uppercaseCat = cat.toUpperCase();
    if (uppercaseCat === 'EV') return 'green';
    if (uppercaseCat === 'COUPE') return 'blue';
    if (uppercaseCat === 'TRUCK') return 'red';
    if (uppercaseCat === 'SUV') return 'yellow';
    return 'white';
  };

  return (
    <div
      id={`vehicle-card-${vehicle.id}`}
      onClick={() => onSelectVehicle && onSelectVehicle(vehicle)}
      className="brutal-card bg-white flex flex-col justify-between h-full transition-all relative hover:-translate-y-1.5 hover:brutal-shadow-xl cursor-pointer group border-4 border-[#0F1B2D]"
    >
      {/* Top Media Container */}
      <div className="relative bg-black h-48 border-b-4 border-[#0F1B2D] overflow-hidden">
        <img
          src={images[0]}
          alt={`${vehicle.make} ${vehicle.model}`}
          onError={(e) => {
            e.currentTarget.src = DEFAULT_VEHICLE_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <Badge variant={getCategoryVariant(vehicle.category)}>
            {vehicle.category}
          </Badge>
          {tags.includes('Limited Edition') && (
            <Badge variant="yellow" className="animate-pulse">
              LIMITED
            </Badge>
          )}
        </div>

        {/* Wishlist & Compare Quick Floating Buttons */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(vehicle);
              }}
              className={`p-1.5 border-2 border-[#0F1B2D] brutal-shadow-sm cursor-pointer transition-transform hover:scale-110 ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-[#0F1B2D] hover:bg-red-50'
              }`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 stroke-[3px] ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          )}

          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(vehicle);
              }}
              className={`p-1.5 border-2 border-[#0F1B2D] brutal-shadow-sm cursor-pointer transition-transform hover:scale-110 ${
                isCompared ? 'bg-[#FFE500] text-[#0F1B2D]' : 'bg-white text-[#0F1B2D] hover:bg-yellow-50'
              }`}
              title={isCompared ? 'Remove comparison' : 'Compare vehicle'}
            >
              <Scale className="w-4 h-4 stroke-[3px]" />
            </button>
          )}
        </div>

        {/* Stock status overlay bar */}
        <div className="absolute bottom-2 left-2.5">
          <Badge variant={isSoldOut ? 'red' : vehicle.quantity < 3 ? 'yellow' : 'green'}>
            {isSoldOut ? 'SOLD OUT' : `STOCK: ${vehicle.quantity}`}
          </Badge>
        </div>
      </div>

      {/* Vehicle Info Content */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-center text-xs font-black uppercase text-neutral-500 tracking-wider mb-0.5">
            <span>{vehicle.make} • {vehicle.year || 2024}</span>
            <span className="font-mono">{vehicle.fuelType || 'Gasoline'}</span>
          </div>

          <h3 className="text-xl font-black uppercase tracking-tight text-[#0F1B2D] leading-tight group-hover:text-amber-600 transition-colors">
            {vehicle.model}
          </h3>

          <div className="text-xs font-bold text-neutral-600 font-mono mt-0.5 truncate">
            {vehicle.variant || vehicle.engineType || 'Performance Trim'}
          </div>

          {/* Quick Specs Pill Row */}
          <div className="grid grid-cols-2 gap-1.5 my-3 text-[11px] font-mono font-bold">
            <div className="bg-slate-100 border border-[#0F1B2D] p-1 px-2 flex items-center justify-between">
              <span className="text-neutral-500">POWER</span>
              <span className="text-[#0F1B2D]">{vehicle.horsepower || 350} HP</span>
            </div>
            <div className="bg-slate-100 border border-[#0F1B2D] p-1 px-2 flex items-center justify-between">
              <span className="text-neutral-500">DRIVE</span>
              <span className="text-[#0F1B2D]">{vehicle.drivetrain || 'AWD'}</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="bg-[#0F1B2D] text-white p-2.5 border-2 border-[#0F1B2D] mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFE500]">
              PRICE
            </span>
            <span className="text-lg font-black font-mono tracking-tight text-[#10B981]">
              ${vehicle.price.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-1 border-t-2 border-slate-200">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="white"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelectVehicle && onSelectVehicle(vehicle);
              }}
              className="w-full flex items-center justify-center gap-1 text-xs"
            >
              <Eye className="w-3.5 h-3.5 stroke-[3px]" />
              DETAILS
            </Button>

            <Button
              variant={isSoldOut ? 'white' : 'yellow'}
              disabled={isSoldOut || purchasing}
              onClick={handlePurchase}
              size="sm"
              className="w-full flex items-center justify-center gap-1 text-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5 stroke-[3px]" />
              {purchasing ? 'BUYING...' : isSoldOut ? 'SOLD OUT' : 'BUY'}
            </Button>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="pt-2 border-t-2 border-[#0F1B2D] grid grid-cols-3 gap-1 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestock && onRestock(vehicle);
                }}
                className="border-2 border-[#0F1B2D] bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-[10px] uppercase py-1 flex items-center justify-center gap-0.5 cursor-pointer"
                title="Restock vehicle"
              >
                <PlusCircle className="w-3 h-3 stroke-[3px]" />
                STOCK
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(vehicle);
                }}
                className="border-2 border-[#0F1B2D] bg-[#3B82F6] hover:bg-[#2563EB] text-white font-extrabold text-[10px] uppercase py-1 flex items-center justify-center gap-0.5 cursor-pointer"
                title="Edit vehicle"
              >
                <Edit className="w-3 h-3 stroke-[3px]" />
                EDIT
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(vehicle);
                }}
                className="border-2 border-[#0F1B2D] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-[10px] uppercase py-1 flex items-center justify-center gap-0.5 cursor-pointer"
                title="Delete vehicle"
              >
                <Trash2 className="w-3 h-3 stroke-[3px]" />
                DEL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

