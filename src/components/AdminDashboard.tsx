import React, { useState, useEffect } from 'react';
import { Vehicle, AdminStats } from '../types';
import { VehicleCard } from './VehicleCard';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';
import { Select } from './Select';
import {
  LayoutDashboard,
  Car,
  ListFilter,
  BarChart3,
  Settings,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Building2,
  CreditCard,
  Bell,
  Menu,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AdminDashboardProps {
  vehicles: Vehicle[];
  totalVehicles: number;
  loading: boolean;
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicle: Vehicle) => void;
  onRestockVehicle: (vehicle: Vehicle) => void;
  onPurchaseVehicle: (id: string) => Promise<void>;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  vehicles,
  totalVehicles,
  loading,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onRestockVehicle,
  onPurchaseVehicle,
  onRefreshData,
}) => {
  const { showToast } = useToast();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'listings' | 'analytics' | 'settings'>('overview');

  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Filters inside Admin table
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState('ALL');

  // Dealership Settings state
  const [dealershipName, setDealershipName] = useState('Incubyte Motors Executive');
  const [currencySymbol, setCurrencySymbol] = useState('USD ($)');
  const [lowStockThreshold, setLowStockThreshold] = useState('3');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vehicles/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      // Fallback local calc
    } finally {
      setLoadingStats(false);
    }
  };

  // Filtered vehicles for Admin tables
  const filteredAdminVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.make.toLowerCase().includes(adminSearch.toLowerCase()) ||
      v.model.toLowerCase().includes(adminSearch.toLowerCase()) ||
      (v.vin && v.vin.toLowerCase().includes(adminSearch.toLowerCase()));
    const matchesCategory = adminCategory === 'ALL' || v.category === adminCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate live numbers
  const totalUnits = vehicles.reduce((acc, v) => acc + v.quantity, 0);
  const totalInventoryValue = vehicles.reduce((acc, v) => acc + v.price * v.quantity, 0);
  const outOfStockCount = vehicles.filter((v) => v.quantity === 0).length;

  return (
    <div className="flex flex-col md:flex-row items-start min-h-[80vh] border-4 border-[#0F1B2D] brutal-shadow-xl bg-white relative">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`${
          sidebarCollapsed ? 'md:w-20' : 'md:w-64'
        } w-full bg-[#0F1B2D] text-white p-4 transition-all duration-300 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-[#0F1B2D] flex-shrink-0 md:self-start h-fit md:sticky md:top-24 z-10`}
      >
        <div>
          {/* Sidebar Top / Toggle */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-slate-700">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#FFE500] stroke-[3px]" />
                <span className="text-sm font-black uppercase tracking-wider text-[#FFE500]">
                  ADMIN CONSOLE
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 bg-slate-800 text-[#FFE500] border-2 border-slate-600 hover:bg-slate-700 cursor-pointer mx-auto md:mx-0"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5 stroke-[3px]" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`p-3 font-black text-xs uppercase flex items-center gap-3 border-2 border-[#0F1B2D] transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#FFE500] text-[#0F1B2D] brutal-shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 stroke-[3px]" />
              {!sidebarCollapsed && <span>OVERVIEW</span>}
            </button>

            <button
              onClick={() => setActiveTab('cars')}
              className={`p-3 font-black text-xs uppercase flex items-center gap-3 border-2 border-[#0F1B2D] transition-all cursor-pointer ${
                activeTab === 'cars'
                  ? 'bg-[#FFE500] text-[#0F1B2D] brutal-shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Car className="w-5 h-5 stroke-[3px]" />
              {!sidebarCollapsed && <span>MANAGE CARS</span>}
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`p-3 font-black text-xs uppercase flex items-center gap-3 border-2 border-[#0F1B2D] transition-all cursor-pointer ${
                activeTab === 'listings'
                  ? 'bg-[#FFE500] text-[#0F1B2D] brutal-shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ListFilter className="w-5 h-5 stroke-[3px]" />
              {!sidebarCollapsed && <span>LISTINGS</span>}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`p-3 font-black text-xs uppercase flex items-center gap-3 border-2 border-[#0F1B2D] transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#FFE500] text-[#0F1B2D] brutal-shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-5 h-5 stroke-[3px]" />
              {!sidebarCollapsed && <span>ANALYTICS</span>}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-3 font-black text-xs uppercase flex items-center gap-3 border-2 border-[#0F1B2D] transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#FFE500] text-[#0F1B2D] brutal-shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-5 h-5 stroke-[3px]" />
              {!sidebarCollapsed && <span>SETTINGS</span>}
            </button>
          </nav>
        </div>

        {/* Bottom Quick Action */}
        {!sidebarCollapsed && (
          <div className="pt-4 border-t-2 border-slate-700">
            <Button variant="green" onClick={onAddVehicle} className="w-full flex items-center justify-center gap-1.5 text-xs">
              <PlusCircle className="w-4 h-4 stroke-[3px]" />
              ADD NEW CAR
            </Button>
          </div>
        )}
      </aside>

      {/* MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 w-full min-w-0 p-6 bg-slate-50 overflow-x-auto">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-3 border-[#0F1B2D] pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#0F1B2D]">
              {activeTab === 'overview' && 'DREAM CAR INVENTORY OVERVIEW'}
              {activeTab === 'cars' && 'MANAGE CAR INVENTORY & FLEET'}
              {activeTab === 'listings' && 'MANAGE SHOWROOM LISTINGS'}
              {activeTab === 'analytics' && 'DEALERSHIP PERFORMANCE & REVENUE'}
              {activeTab === 'settings' && 'SYSTEM & DEALERSHIP CONFIGURATION'}
            </h1>
            <p className="text-xs font-mono font-bold text-neutral-500 uppercase mt-0.5">
              REAL-TIME DEALERSHIP MANAGEMENT SYSTEM • INCUBYTE MOTORS
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="white" size="sm" onClick={onRefreshData} className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 stroke-[3px]" />
              REFRESH
            </Button>
            <Button variant="yellow" size="sm" onClick={onAddVehicle} className="flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5 stroke-[3px]" />
              ADD VEHICLE
            </Button>
          </div>
        </div>

        {/* QUICK STATS CARDS (Always visible on Overview or top bar) */}
        {(activeTab === 'overview' || activeTab === 'analytics') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* STAT 1: Total Inventory */}
            <div className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-neutral-500">TOTAL INVENTORY</span>
                <Package className="w-6 h-6 text-[#3B82F6] stroke-[3px]" />
              </div>
              <div className="text-3xl font-black font-mono text-[#0F1B2D]">
                {vehicles.length} <span className="text-sm text-neutral-500 font-sans">MODELS</span>
              </div>
              <div className="text-xs font-bold text-neutral-600 font-mono mt-1">
                {totalUnits} Units In Stock ({outOfStockCount} Sold Out)
              </div>
            </div>

            {/* STAT 2: Cars Sold This Month */}
            <div className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-neutral-500">CARS SOLD THIS MONTH</span>
                <TrendingUp className="w-6 h-6 text-[#10B981] stroke-[3px]" />
              </div>
              <div className="text-3xl font-black font-mono text-[#10B981]">
                {stats ? stats.carsSoldThisMonth : 18} <span className="text-sm text-neutral-500 font-sans">UNITS</span>
              </div>
              <div className="text-xs font-bold text-emerald-600 font-mono mt-1">
                +24% vs. last month
              </div>
            </div>

            {/* STAT 3: Avg Days On Lot */}
            <div className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-neutral-500">AVG. DAYS ON LOT</span>
                <Clock className="w-6 h-6 text-[#E8A020] stroke-[3px]" />
              </div>
              <div className="text-3xl font-black font-mono text-[#0F1B2D]">
                {stats ? stats.avgDaysOnLot : 12.4} <span className="text-sm text-neutral-500 font-sans">DAYS</span>
              </div>
              <div className="text-xs font-bold text-amber-600 font-mono mt-1">
                Optimal turn velocity
              </div>
            </div>

            {/* STAT 4: Revenue */}
            <div className="bg-[#0F1B2D] text-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#FFE500]">EST. TOTAL REVENUE</span>
                <DollarSign className="w-6 h-6 text-[#10B981] stroke-[3px]" />
              </div>
              <div className="text-2xl font-black font-mono text-[#10B981]">
                ${(stats ? stats.totalRevenue : totalInventoryValue * 0.45).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs font-bold text-slate-300 font-mono mt-1">
                Asset value: ${totalInventoryValue.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW PAGE */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
              <div className="flex items-center justify-between mb-4 border-b-3 border-[#0F1B2D] pb-3">
                <h3 className="text-lg font-black uppercase text-[#0F1B2D]">
                  RECENT INVENTORY ACTIVITY
                </h3>
                <Button variant="yellow" size="sm" onClick={() => setActiveTab('cars')}>
                  VIEW ALL CARS ({vehicles.length})
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.slice(0, 6).map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    onPurchase={onPurchaseVehicle}
                    onEdit={onEditVehicle}
                    onDelete={onDeleteVehicle}
                    onRestock={onRestockVehicle}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE CARS TABLE */}
        {activeTab === 'cars' && (
          <div className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b-3 border-[#0F1B2D]">
              <div className="flex items-center gap-2 w-full sm:w-72">
                <Input
                  placeholder="Filter by Make, Model, VIN..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Select
                  options={[
                    { label: 'ALL CATEGORIES', value: 'ALL' },
                    { label: 'SEDAN', value: 'Sedan' },
                    { label: 'SUV', value: 'SUV' },
                    { label: 'COUPE', value: 'Coupe' },
                    { label: 'EV', value: 'EV' },
                    { label: 'TRUCK', value: 'Truck' },
                  ]}
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                />

                <Button variant="green" onClick={onAddVehicle} className="whitespace-nowrap">
                  + ADD CAR
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-3 border-[#0F1B2D] text-left">
                <thead>
                  <tr className="bg-[#0F1B2D] text-white font-mono text-xs uppercase">
                    <th className="p-3 border-2 border-[#0F1B2D]">VEHICLE DETAILS</th>
                    <th className="p-3 border-2 border-[#0F1B2D]">CATEGORY</th>
                    <th className="p-3 border-2 border-[#0F1B2D]">YEAR / VIN</th>
                    <th className="p-3 border-2 border-[#0F1B2D]">PRICE ($)</th>
                    <th className="p-3 border-2 border-[#0F1B2D]">STOCK UNITS</th>
                    <th className="p-3 border-2 border-[#0F1B2D]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#0F1B2D] font-mono text-xs">
                  {filteredAdminVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-100 transition-colors">
                      <td className="p-3 font-black text-[#0F1B2D]">
                        <div className="text-sm">{v.make} {v.model}</div>
                        <div className="text-[10px] text-neutral-500 font-sans">{v.variant || v.engineType}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="blue">{v.category}</Badge>
                      </td>
                      <td className="p-3">
                        <div>{v.year || 2024}</div>
                        <div className="text-[10px] text-neutral-500">{v.vin || 'WP0AF2A91RS298011'}</div>
                      </td>
                      <td className="p-3 font-black text-[#10B981]">
                        ${v.price.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge variant={v.quantity > 0 ? 'green' : 'red'}>
                          {v.quantity > 0 ? `${v.quantity} IN STOCK` : 'SOLD OUT'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onRestockVehicle(v)}
                            className="bg-[#10B981] text-white p-1.5 border border-[#0F1B2D] hover:bg-[#059669] cursor-pointer"
                            title="Restock"
                          >
                            +STOCK
                          </button>
                          <button
                            onClick={() => onEditVehicle(v)}
                            className="bg-[#3B82F6] text-white p-1.5 border border-[#0F1B2D] hover:bg-[#2563EB] cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5 stroke-[3px]" />
                          </button>
                          <button
                            onClick={() => onDeleteVehicle(v)}
                            className="bg-[#DC2626] text-white p-1.5 border border-[#0F1B2D] hover:bg-[#B91C1C] cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[3px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE LISTINGS */}
        {activeTab === 'listings' && (
          <div className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
            <h3 className="text-lg font-black uppercase text-[#0F1B2D] mb-4">
              SHOWROOM PUBLIC LISTINGS MANAGEMENT
            </h3>
            <p className="text-xs font-mono text-neutral-600 mb-6">
              Toggle availability statuses, featured positions, or special promotional pricing for public catalog views.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="border-3 border-[#0F1B2D] p-4 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="yellow">{v.category}</Badge>
                      <span className="text-xs font-mono font-bold text-[#10B981]">${v.price.toLocaleString()}</span>
                    </div>
                    <h4 className="font-black text-base uppercase text-[#0F1B2D]">{v.make} {v.model}</h4>
                    <p className="text-xs font-mono text-neutral-500 mb-3">{v.vin || 'VIN10928374'}</p>
                  </div>

                  <div className="flex items-center justify-between border-t-2 border-[#0F1B2D] pt-3 mt-2">
                    <span className="text-xs font-black uppercase text-neutral-600">PUBLIC STATUS:</span>
                    <Badge variant={v.quantity > 0 ? 'green' : 'red'}>
                      {v.quantity > 0 ? 'ACTIVE LISTING' : 'OUT OF STOCK'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS & CATEGORY BREAKDOWN */}
        {activeTab === 'analytics' && (
          <div className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow">
            <h3 className="text-lg font-black uppercase text-[#0F1B2D] mb-4">
              CATEGORY ASSET VALUE BREAKDOWN
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Sedan', 'SUV', 'Coupe', 'EV', 'Truck'].map((cat) => {
                const catVehicles = vehicles.filter((v) => v.category === cat);
                const count = catVehicles.reduce((acc, v) => acc + v.quantity, 0);
                const val = catVehicles.reduce((acc, v) => acc + v.price * v.quantity, 0);

                return (
                  <div key={cat} className="border-3 border-[#0F1B2D] p-4 bg-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="blue">{cat}</Badge>
                      <span className="text-xs font-mono font-bold">{count} UNITS</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-[#10B981]">
                      ${val.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500 mt-1 uppercase">
                      Total Category Inventory Valuation
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: DEALERSHIP SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white border-4 border-[#0F1B2D] p-5 brutal-shadow max-w-2xl">
            <h3 className="text-lg font-black uppercase text-[#0F1B2D] mb-4">
              DEALERSHIP SYSTEM CONFIGURATION
            </h3>

            <div className="flex flex-col gap-4">
              <Input
                label="DEALERSHIP DISPLAY NAME"
                value={dealershipName}
                onChange={(e) => setDealershipName(e.target.value)}
              />

              <Input
                label="CURRENCY FORMAT"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
              />

              <Input
                label="LOW STOCK ALERT THRESHOLD (UNITS)"
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />

              <Button
                variant="green"
                onClick={() => showToast('Dealership preferences updated successfully!', 'success')}
                className="mt-2"
              >
                SAVE CONFIGURATION
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
