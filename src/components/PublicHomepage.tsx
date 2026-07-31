import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types';
import { VehicleCard } from './VehicleCard';
import { Button } from './Button';
import { Badge } from './Badge';
import { getVehicleImages, DEFAULT_VEHICLE_IMAGE } from '../utils/vehicleUtils';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  ShieldCheck,
  CheckCircle2,
  Car,
  X,
  Filter,
} from 'lucide-react';

interface PublicHomepageProps {
  vehicles: Vehicle[];
  totalVehicles: number;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedMake: string;
  onMakeChange: (make: string) => void;
  selectedFuel: string;
  onFuelChange: (fuel: string) => void;
  selectedCondition: string;
  onConditionChange: (cond: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onPurchase: (id: string) => Promise<void>;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRestock?: (vehicle: Vehicle) => void;
  wishlistIds: string[];
  onToggleWishlist: (vehicle: Vehicle) => void;
  compareIds: string[];
  onToggleCompare: (vehicle: Vehicle) => void;
  onResetFilters: () => void;
}

const BRANDS = [
  { name: 'Porsche', count: '10 Models', logo: '🏎️' },
  { name: 'BMW', count: '14 Models', logo: '⚡' },
  { name: 'Mercedes-Benz', count: '12 Models', logo: '⭐' },
  { name: 'Audi', count: '8 Models', logo: '⭕' },
  { name: 'Tesla', count: '6 Models', logo: '🔋' },
  { name: 'Ferrari', count: '4 Models', logo: '🐎' },
  { name: 'Ford', count: '9 Models', logo: '🛻' },
  { name: 'Lamborghini', count: '3 Models', logo: '🐂' },
];

export const PublicHomepage: React.FC<PublicHomepageProps> = ({
  vehicles,
  totalVehicles,
  loading,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedMake,
  onMakeChange,
  selectedFuel,
  onFuelChange,
  selectedCondition,
  onConditionChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
  onSelectVehicle,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  wishlistIds,
  onToggleWishlist,
  compareIds,
  onToggleCompare,
  onResetFilters,
}) => {
  const [autocompleteFocused, setAutocompleteFocused] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Limited Edition Cars for Carousel
  const limitedEditionCars = useMemo(() => {
    return vehicles.filter((v) => {
      if (!v.tags) return false;
      const t = typeof v.tags === 'string' ? v.tags : JSON.stringify(v.tags);
      return t.includes('Limited Edition') || t.includes('Featured');
    });
  }, [vehicles]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return vehicles
      .filter((v) => `${v.make} ${v.model} ${v.variant || ''}`.toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery, vehicles]);

  const activeLimitedCar = limitedEditionCars[carouselIdx] || limitedEditionCars[0] || vehicles[0];

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* HERO BANNER SECTION */}
      <section className="relative border-4 border-[#0F1B2D] brutal-shadow-xl bg-[#0F1B2D] text-white p-6 md:p-12 overflow-hidden">
        {/* Background Overlay Accent */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#FFE500] rounded-full opacity-10 pointer-events-none blur-3xl"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#FFE500] text-[#0F1B2D] font-black text-xs uppercase px-3 py-1 border-2 border-[#FFE500] mb-4 brutal-shadow-sm">
            <Sparkles className="w-4 h-4 stroke-[3px]" />
            INCUBYTE MOTORS • EXECUTIVE AUTOMOTIVE SHOWROOM
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none mb-4 text-white">
            FIND YOUR <span className="text-[#FFE500] underline decoration-[#10B981] decoration-4">DREAM MACHINE</span>
          </h1>

          <p className="text-sm sm:text-base font-bold text-slate-300 uppercase max-w-2xl mb-8 leading-relaxed font-mono">
            Browse curations of precision engineering, luxury performance, and certified electric vehicles across world class brands.
          </p>

          {/* Autocomplete Search Bar */}
          <div className="relative max-w-2xl">
            <div className="relative flex items-center bg-white border-4 border-[#0F1B2D] brutal-shadow">
              <Search className="w-6 h-6 text-[#0F1B2D] ml-4 stroke-[3px]" />
              <input
                type="text"
                placeholder="Search make, model, trim (e.g. Porsche 911, Tesla, Taycan)..."
                value={searchQuery}
                onFocus={() => setAutocompleteFocused(true)}
                onBlur={() => setTimeout(() => setAutocompleteFocused(false), 200)}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full py-4 px-3 text-[#0F1B2D] font-black text-sm uppercase focus:outline-none placeholder:text-neutral-400 placeholder:normal-case font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-2 text-neutral-500 hover:text-black mr-2 cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[3px]" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown Popup */}
            {autocompleteFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border-4 border-[#0F1B2D] brutal-shadow-xl z-50 divide-y-2 divide-[#0F1B2D]">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onMouseDown={() => {
                      onSelectVehicle(s);
                      setAutocompleteFocused(false);
                    }}
                    className="w-full text-left p-3 hover:bg-[#FFE500] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-black uppercase text-[#0F1B2D]">{s.make} {s.model}</div>
                      <div className="text-[10px] font-mono text-neutral-500">{s.category} • {s.horsepower || 350} HP</div>
                    </div>
                    <span className="text-xs font-black font-mono text-[#10B981]">${s.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tag Pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap text-xs font-bold font-mono">
            <span className="text-slate-400 text-[10px] uppercase">POPULAR:</span>
            {['Porsche', 'Tesla', 'EV', 'SUV', '911 GT3'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (['Porsche', 'Tesla'].includes(tag)) onMakeChange(tag);
                  else if (['EV', 'SUV'].includes(tag)) onCategoryChange(tag);
                  else onSearchChange(tag);
                }}
                className="bg-slate-800 hover:bg-[#FFE500] hover:text-[#0F1B2D] text-white px-2.5 py-1 border border-slate-600 transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND LOGOS STRIP */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#0F1B2D] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#E8A020] stroke-[3px]" />
            FEATURED AUTOMOTIVE MANUFACTURERS
          </h3>
          {selectedMake !== 'ALL' && (
            <button
              onClick={() => onMakeChange('ALL')}
              className="text-xs font-extrabold text-[#3B82F6] hover:underline cursor-pointer"
            >
              RESET BRAND FILTER
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {BRANDS.map((brand) => {
            const isSelected = selectedMake.toLowerCase() === brand.name.toLowerCase();
            return (
              <button
                key={brand.name}
                onClick={() => onMakeChange(isSelected ? 'ALL' : brand.name)}
                className={`p-3 border-3 border-[#0F1B2D] flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFE500] text-[#0F1B2D] brutal-shadow-sm scale-105'
                    : 'bg-white hover:bg-slate-50 hover:brutal-shadow-sm'
                }`}
              >
                <span className="text-2xl mb-1">{brand.logo}</span>
                <span className="text-xs font-black uppercase text-center leading-none">{brand.name}</span>
                <span className="text-[10px] font-mono text-neutral-500 mt-1">{brand.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* LIMITED EDITION CAROUSEL HIGHLIGHT */}
      {activeLimitedCar && (
        <section className="bg-slate-900 border-4 border-[#0F1B2D] brutal-shadow-lg text-white p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b-2 border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#FFE500] stroke-[3px] animate-bounce" />
              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                LIMITED EDITION & FEATURED SHOWCASE
              </h2>
            </div>
            {limitedEditionCars.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCarouselIdx((prev) => (prev === 0 ? limitedEditionCars.length - 1 : prev - 1))}
                  className="bg-slate-800 text-white p-1.5 border-2 border-slate-600 hover:bg-[#FFE500] hover:text-[#0F1B2D] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3px]" />
                </button>
                <span className="text-xs font-mono font-bold">
                  {carouselIdx + 1} / {limitedEditionCars.length}
                </span>
                <button
                  onClick={() => setCarouselIdx((prev) => (prev === limitedEditionCars.length - 1 ? 0 : prev + 1))}
                  className="bg-slate-800 text-white p-1.5 border-2 border-slate-600 hover:bg-[#FFE500] hover:text-[#0F1B2D] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 stroke-[3px]" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 h-72 sm:h-80 bg-black border-4 border-slate-700 overflow-hidden relative group">
              <img
                src={getVehicleImages(activeLimitedCar)[0]}
                alt={activeLimitedCar.model}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_VEHICLE_IMAGE;
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="yellow">LIMITED EDITION</Badge>
                <Badge variant="green">{activeLimitedCar.category}</Badge>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-black uppercase text-[#FFE500] tracking-wider">
                  {activeLimitedCar.make} • {activeLimitedCar.year || 2024}
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight text-white mt-1 mb-2">
                  {activeLimitedCar.model}
                </h3>
                <p className="text-xs font-mono text-slate-300 mb-4 line-clamp-3">
                  {activeLimitedCar.variant || 'Pinnacle performance engineering with track-tuned chassis, carbon composite aerodynamics, and bespoke luxury interior craftsmanship.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-6">
                  <div className="bg-slate-800 border border-slate-700 p-2">
                    <span className="text-slate-400 block text-[10px]">HORSEPOWER</span>
                    <span className="font-bold text-white text-sm">{activeLimitedCar.horsepower || 500} HP</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-2">
                    <span className="text-slate-400 block text-[10px]">DRIVETRAIN</span>
                    <span className="font-bold text-[#10B981] text-sm">{activeLimitedCar.drivetrain || 'AWD'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-black p-4 border-2 border-slate-700">
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">EXCLUSIVITY PRICE</div>
                  <div className="text-2xl font-black font-mono text-[#10B981]">
                    ${activeLimitedCar.price.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button variant="white" size="sm" onClick={() => onEdit(activeLimitedCar)}>
                      EDIT (ADMIN)
                    </Button>
                  )}
                  <Button variant="yellow" onClick={() => onSelectVehicle(activeLimitedCar)}>
                    INSPECT MODEL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FILTER & SORT BAR */}
      <section id="showroom-catalog" className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-3 border-[#0F1B2D] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#0F1B2D] stroke-[3px]" />
            <h3 className="text-lg font-black uppercase tracking-tight text-[#0F1B2D]">
              CATALOG FILTER MATRIX
            </h3>
            <span className="text-xs font-black font-mono bg-[#FFE500] px-2 py-0.5 border border-[#0F1B2D]">
              {totalVehicles} MATCHES
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={onResetFilters}
              className="text-xs font-black text-red-600 hover:underline uppercase cursor-pointer"
            >
              RESET ALL FILTERS
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-neutral-600">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="brutal-input py-1 px-2 text-xs font-black uppercase"
              >
                <option value="newest">NEWEST ADDITIONS</option>
                <option value="price_asc">PRICE: LOW TO HIGH</option>
                <option value="price_desc">PRICE: HIGH TO LOW</option>
                <option value="year_desc">MODEL YEAR: NEWEST</option>
                <option value="hp_desc">HORSEPOWER: HIGHEST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Category Dropdown */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-500 block mb-1">BODY CATEGORY</label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="brutal-input w-full text-xs font-bold uppercase"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="Sedan">SEDAN</option>
              <option value="SUV">SUV</option>
              <option value="Coupe">COUPE</option>
              <option value="EV">ELECTRIC (EV)</option>
              <option value="Truck">TRUCK</option>
            </select>
          </div>

          {/* Make / Brand Dropdown */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-500 block mb-1">BRAND / MAKE</label>
            <select
              value={selectedMake}
              onChange={(e) => onMakeChange(e.target.value)}
              className="brutal-input w-full text-xs font-bold uppercase"
            >
              <option value="ALL">ALL BRANDS</option>
              {['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla', 'Ford', 'Ferrari', 'Lamborghini', 'Cadillac', 'Chevrolet'].map((m) => (
                <option key={m} value={m}>
                  {m.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type Dropdown */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-500 block mb-1">FUEL POWERTRAIN</label>
            <select
              value={selectedFuel}
              onChange={(e) => onFuelChange(e.target.value)}
              className="brutal-input w-full text-xs font-bold uppercase"
            >
              <option value="ALL">ALL POWERTRAINS</option>
              <option value="Gasoline">GASOLINE</option>
              <option value="Electric">ELECTRIC</option>
              <option value="Hybrid">HYBRID</option>
              <option value="Diesel">DIESEL</option>
            </select>
          </div>

          {/* Vehicle Condition */}
          <div>
            <label className="text-[10px] font-black uppercase text-neutral-500 block mb-1">CONDITION</label>
            <select
              value={selectedCondition}
              onChange={(e) => onConditionChange(e.target.value)}
              className="brutal-input w-full text-xs font-bold uppercase"
            >
              <option value="ALL">ALL CONDITIONS</option>
              <option value="New">BRAND NEW</option>
              <option value="Used">PRE-OWNED</option>
              <option value="Certified Pre-Owned">CERTIFIED CPO</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black uppercase text-neutral-500">MAX PRICE</label>
              <span className="text-xs font-mono font-black text-[#10B981]">
                ${priceRange[1].toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={20000}
              max={300000}
              step={10000}
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-[#0F1B2D] cursor-pointer mt-1"
            />
          </div>
        </div>
      </section>

      {/* ALL MODELS GRID & SHOWROOM */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] flex items-center gap-2">
            <Car className="w-6 h-6 text-[#0F1B2D] stroke-[3px]" />
            CURRENT INVENTORY CATALOG
          </h2>
          <span className="text-xs font-black font-mono text-neutral-600">
            SHOWING {vehicles.length} OF {totalVehicles} CARS
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border-4 border-[#0F1B2D] bg-slate-100 h-80 animate-pulse p-4 flex flex-col justify-between">
                <div className="bg-slate-300 h-40 w-full mb-4"></div>
                <div className="bg-slate-300 h-6 w-3/4 mb-2"></div>
                <div className="bg-slate-300 h-10 w-full"></div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="border-4 border-[#0F1B2D] bg-white p-12 text-center brutal-shadow">
            <Car className="w-16 h-16 text-neutral-400 mx-auto mb-3 stroke-[3px]" />
            <h3 className="text-xl font-black uppercase text-[#0F1B2D] mb-1">NO VEHICLES MATCH YOUR CRITERIA</h3>
            <p className="text-xs font-extrabold uppercase text-neutral-500 max-w-sm mx-auto mb-4">
              Try adjusting your price filter, selecting different body categories, or clearing your search term.
            </p>
            <Button variant="yellow" onClick={onResetFilters}>
              CLEAR ALL FILTERS
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onSelectVehicle={onSelectVehicle}
                onPurchase={onPurchase}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestock={onRestock}
                isWishlisted={wishlistIds.includes(v.id)}
                onToggleWishlist={onToggleWishlist}
                isCompared={compareIds.includes(v.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t-3 border-[#0F1B2D]">
            <Button
              variant="white"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3px]" />
              PREVIOUS
            </Button>

            <span className="text-xs font-mono font-black text-[#0F1B2D] bg-[#FFE500] px-3 py-2 border-2 border-[#0F1B2D]">
              PAGE {currentPage} OF {totalPages}
            </span>

            <Button
              variant="white"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="flex items-center gap-1"
            >
              NEXT
              <ChevronRight className="w-4 h-4 stroke-[3px]" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
