import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { Modal } from './Modal';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { getVehicleImages, getVehicleTags } from '../utils/vehicleUtils';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleData: Partial<Vehicle> & {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
  }) => Promise<void>;
  initialData?: Vehicle | null;
}

const CATEGORY_OPTIONS = [
  { label: 'SEDAN', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'TRUCK', value: 'Truck' },
  { label: 'EV', value: 'EV' },
  { label: 'COUPE', value: 'Coupe' },
  { label: 'CONVERTIBLE', value: 'Convertible' },
];

const FUEL_OPTIONS = [
  { label: 'GASOLINE', value: 'Gasoline' },
  { label: 'ELECTRIC', value: 'Electric' },
  { label: 'HYBRID', value: 'Hybrid' },
  { label: 'DIESEL', value: 'Diesel' },
];

const CONDITION_OPTIONS = [
  { label: 'NEW', value: 'New' },
  { label: 'USED', value: 'Used' },
  { label: 'CERTIFIED PRE-OWNED', value: 'Certified Pre-Owned' },
];

const STATUS_OPTIONS = [
  { label: 'AVAILABLE', value: 'Available' },
  { label: 'SOLD OUT / SOLD', value: 'Sold' },
  { label: 'RESERVED', value: 'Reserved' },
  { label: 'IN TRANSIT', value: 'In Transit' },
];

const DRIVETRAIN_OPTIONS = [
  { label: 'AWD', value: 'AWD' },
  { label: 'RWD', value: 'RWD' },
  { label: 'FWD', value: 'FWD' },
  { label: '4WD', value: '4WD' },
];

const PRESET_TAGS = [
  'Limited Edition',
  'Trending',
  'Featured',
  'Best Seller',
  'New Arrival',
  'Special Edition',
  'Electric Special',
];

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState('2024');
  const [category, setCategory] = useState('Sedan');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [vin, setVin] = useState('');
  const [engineType, setEngineType] = useState('V6 Turbo');
  const [engineDisplacement, setEngineDisplacement] = useState('3.0L');
  const [horsepower, setHorsepower] = useState('350');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Gasoline');
  const [mileage, setMileage] = useState('0');
  const [seatingCapacity, setSeatingCapacity] = useState('5');
  const [drivetrain, setDrivetrain] = useState('AWD');
  const [condition, setCondition] = useState('New');
  const [status, setStatus] = useState('Available');
  const [imageUrls, setImageUrls] = useState('');
  const [tagInput, setTagInput] = useState('Featured');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setMake(initialData.make);
      setModel(initialData.model);
      setVariant(initialData.variant || '');
      setYear((initialData.year || 2024).toString());
      setCategory(initialData.category);
      setPrice(initialData.price.toString());
      setQuantity(initialData.quantity.toString());
      setVin(initialData.vin || '');
      setEngineType(initialData.engineType || 'V6 Turbo');
      setEngineDisplacement(initialData.engineDisplacement || '3.0L');
      setHorsepower((initialData.horsepower || 350).toString());
      setTransmission(initialData.transmission || 'Automatic');
      setFuelType(initialData.fuelType || 'Gasoline');
      setMileage((initialData.mileage || 0).toString());
      setSeatingCapacity((initialData.seatingCapacity || 5).toString());
      setDrivetrain(initialData.drivetrain || 'AWD');
      setCondition(initialData.condition || 'New');
      setStatus(initialData.status || 'Available');
      const imgs = getVehicleImages(initialData);
      setImageUrls(imgs.join(',\n'));
      const tgs = getVehicleTags(initialData);
      setTagInput(tgs.join(', '));
    } else {
      setMake('');
      setModel('');
      setVariant('');
      setYear('2024');
      setCategory('Sedan');
      setPrice('');
      setQuantity('');
      setVin('');
      setEngineType('V6 Turbo');
      setEngineDisplacement('3.0L');
      setHorsepower('350');
      setTransmission('Automatic');
      setFuelType('Gasoline');
      setMileage('0');
      setSeatingCapacity('5');
      setDrivetrain('AWD');
      setCondition('New');
      setStatus('Available');
      setImageUrls('');
      setTagInput('Featured');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const togglePresetTag = (tag: string) => {
    const currentTags = tagInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (currentTags.includes(tag)) {
      setTagInput(currentTags.filter((t) => t !== tag).join(', '));
    } else {
      setTagInput([...currentTags, tag].join(', '));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!make.trim()) newErrors.make = 'Make is required';
    if (!model.trim()) newErrors.model = 'Model is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (quantity === '' || isNaN(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const parsedTags = tagInput.split(',').map((s) => s.trim()).filter(Boolean);
      const parsedImages = imageUrls
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const imagesArr = parsedImages.length > 0
        ? parsedImages
        : ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'];

      await onSubmit({
        make: make.trim(),
        model: model.trim(),
        variant: variant.trim(),
        year: Number(year) || 2024,
        category,
        price: Number(price),
        quantity: Number(quantity),
        vin: vin.trim() || `VIN${Date.now()}`,
        engineType,
        engineDisplacement,
        horsepower: Number(horsepower) || 350,
        transmission,
        fuelType,
        mileage: Number(mileage) || 0,
        seatingCapacity: Number(seatingCapacity) || 5,
        drivetrain,
        condition,
        status,
        images: JSON.stringify(imagesArr),
        tags: JSON.stringify(parsedTags),
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save vehicle' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'EDIT VEHICLE INVENTORY' : 'ADD NEW VEHICLE RECORD'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.form && (
          <div className="bg-[#DC2626] text-white p-3 border-3 border-[#0F1B2D] font-extrabold text-sm uppercase">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="MAKE / BRAND *"
            placeholder="Porsche, BMW, Tesla"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            error={errors.make}
          />
          <Input
            label="MODEL NAME *"
            placeholder="911 GT3, M5, Cybertruck"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            error={errors.model}
          />
          <Input
            label="VARIANT / TRIM"
            placeholder="Weissach Package, Competition"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="YEAR"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Select
            label="CATEGORY"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            label="PRICE ($) *"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
          />
          <Input
            label="STOCK UNITS *"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            error={errors.quantity}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="VIN CODE"
            placeholder="WP0AF2A91RS298011"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
          />
          <Input
            label="ENGINE TYPE"
            placeholder="Twin-Turbo V8"
            value={engineType}
            onChange={(e) => setEngineType(e.target.value)}
          />
          <Input
            label="DISPLACEMENT"
            placeholder="4.0L V8"
            value={engineDisplacement}
            onChange={(e) => setEngineDisplacement(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="HORSEPOWER (HP)"
            type="number"
            value={horsepower}
            onChange={(e) => setHorsepower(e.target.value)}
          />
          <Input
            label="TRANSMISSION"
            placeholder="7-Speed PDK / Auto"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
          />
          <Select
            label="FUEL TYPE"
            options={FUEL_OPTIONS}
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
          />
          <Select
            label="DRIVETRAIN"
            options={DRIVETRAIN_OPTIONS}
            value={drivetrain}
            onChange={(e) => setDrivetrain(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="MILEAGE (MI)"
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
          />
          <Select
            label="CONDITION"
            options={CONDITION_OPTIONS}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
          <Select
            label="INVENTORY STATUS"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>

        {/* Tag Selection & Editing Box */}
        <div className="bg-slate-50 border-3 border-[#0F1B2D] p-3 flex flex-col gap-2">
          <label className="text-xs font-black uppercase text-[#0F1B2D]">
            SHOWCASE BADGES & TAGS (CLICK TO TOGGLE)
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map((tag) => {
              const active = tagInput
                .split(',')
                .map((s) => s.trim())
                .includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => togglePresetTag(tag)}
                  className={`text-xs font-black uppercase px-2.5 py-1 border-2 border-[#0F1B2D] cursor-pointer transition-all ${
                    active
                      ? 'bg-[#FFE500] text-[#0F1B2D] brutal-shadow-sm scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {active ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}
          </div>

          <Input
            label="CUSTOM TAGS (COMMA SEPARATED)"
            placeholder="Limited Edition, Trending, Featured, Best Seller"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
        </div>

        {/* Image URLs Field */}
        <div>
          <label className="text-xs font-black uppercase text-[#0F1B2D] block mb-1">
            DEMO IMAGE URLS (ONE PER LINE OR COMMA SEPARATED)
          </label>
          <textarea
            rows={3}
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="brutal-input w-full font-mono text-xs"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t-3 border-[#0F1B2D]">
          <Button type="button" variant="white" onClick={onClose}>
            CANCEL
          </Button>
          <Button type="submit" variant="green" disabled={loading}>
            {loading ? 'SAVING RECORD...' : initialData ? 'UPDATE RECORD' : 'SAVE TO INVENTORY'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

