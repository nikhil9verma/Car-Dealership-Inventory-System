import React from 'react';
import { SearchFilters } from '../types';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Search, RotateCcw, Filter } from 'lucide-react';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: Partial<SearchFilters>) => void;
  onReset: () => void;
}

const CATEGORY_OPTIONS = [
  { label: 'ALL CATEGORIES', value: 'ALL' },
  { label: 'SEDAN', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'TRUCK', value: 'Truck' },
  { label: 'EV', value: 'EV' },
  { label: 'COUPE', value: 'Coupe' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="brutal-card bg-[#0F1B2D] p-4 md:p-6 mb-8 brutal-shadow-lg">
      <div className="flex items-center justify-between border-b-3 border-[#2A3F5A] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-6 h-6 stroke-[3px] text-[#E8A020]" />
          <h2 className="text-lg font-black uppercase tracking-tight text-white">
            INVENTORY SEARCH &amp; FILTER
          </h2>
        </div>
        <button
          onClick={onReset}
          className="border-2 border-[#E8A020] bg-transparent hover:bg-[#E8A020] hover:text-[#0F1B2D] text-[#E8A020] px-3 py-1 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[3px]" />
          RESET FILTERS
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          label="MAKE"
          placeholder="e.g. Porsche, Tesla"
          value={filters.make}
          onChange={(e) => onFilterChange({ make: e.target.value })}
        />

        <Input
          label="MODEL"
          placeholder="e.g. 911, GT3"
          value={filters.model}
          onChange={(e) => onFilterChange({ model: e.target.value })}
        />

        <Select
          label="CATEGORY"
          options={CATEGORY_OPTIONS}
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
        />

        <Input
          label="MIN PRICE ($)"
          type="number"
          placeholder="0"
          value={filters.minPrice}
          onChange={(e) => onFilterChange({ minPrice: e.target.value })}
        />

        <Input
          label="MAX PRICE ($)"
          type="number"
          placeholder="500000"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
        />
      </div>
    </div>
  );
};
