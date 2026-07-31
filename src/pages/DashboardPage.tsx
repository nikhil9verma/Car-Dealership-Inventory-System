import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Header } from '../components/Header';
import { PublicHomepage } from '../components/PublicHomepage';
import { AdminDashboard } from '../components/AdminDashboard';
import { VehicleDetailModal } from '../components/VehicleDetailModal';
import { CompareModal } from '../components/CompareModal';
import { WishlistDrawer } from '../components/WishlistDrawer';
import { VehicleFormModal } from '../components/VehicleFormModal';
import { DeleteModal } from '../components/DeleteModal';
import { RestockModal } from '../components/RestockModal';
import { ChatWidget } from '../components/ChatWidget';

export const DashboardPage: React.FC<{ onOpenAuth?: () => void }> = ({ onOpenAuth }) => {
  const { token, isAdmin, logout } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<'showroom' | 'admin'>('showroom');

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMake, setSelectedMake] = useState('ALL');
  const [selectedFuel, setSelectedFuel] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState('ALL');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000]);
  const [sortBy, setSortBy] = useState('newest');

  // Modals & Drawers state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareList, setCompareList] = useState<Vehicle[]>([]);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('incubyte_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Admin Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [restockingVehicle, setRestockingVehicle] = useState<Vehicle | null>(null);

  // Persist Wishlist in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('incubyte_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      // ignore
    }
  }, [wishlist]);

  // Main catalog fetcher (Public endpoint or Auth endpoint)
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.append('model', searchQuery.trim());
      if (selectedCategory !== 'ALL') queryParams.append('category', selectedCategory);
      if (selectedMake !== 'ALL') queryParams.append('make', selectedMake);
      if (selectedFuel !== 'ALL') queryParams.append('fuelType', selectedFuel);
      if (selectedCondition !== 'ALL') queryParams.append('condition', selectedCondition);
      if (priceRange[1] < 300000) queryParams.append('maxPrice', priceRange[1].toString());
      if (sortBy) queryParams.append('sortBy', sortBy);
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '9');

      let url = `/api/vehicles/public/catalog?${queryParams.toString()}`;
      let headers: Record<string, string> = {};

      if (token) {
        url = `/api/vehicles/search?${queryParams.toString()}`;
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });

      // If token is invalid/expired, clear auth and fall back to public catalog
      if (res.status === 401) {
        logout();
        const publicRes = await fetch(`/api/vehicles/public/catalog?${queryParams.toString()}`);
        const publicData = await publicRes.json();
        setVehicles(publicData.vehicles || []);
        setTotalVehicles(publicData.total || 0);
        setTotalPages(publicData.totalPages || 1);
        return;
      }

      if (!res.ok) throw new Error('Error loading showroom inventory');

      const data = await res.json();
      setVehicles(data.vehicles || []);
      setTotalVehicles(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      showToast(err.message || 'Error fetching cars', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    token,
    logout,
    searchQuery,
    selectedCategory,
    selectedMake,
    selectedFuel,
    selectedCondition,
    priceRange,
    sortBy,
    currentPage,
    showToast,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedMake('ALL');
    setSelectedFuel('ALL');
    setSelectedCondition('ALL');
    setPriceRange([0, 300000]);
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Wishlist Toggle
  const handleToggleWishlist = (vehicle: Vehicle) => {
    setWishlist((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) {
        showToast(`Removed ${vehicle.make} ${vehicle.model} from Wishlist`, 'info');
        return prev.filter((v) => v.id !== vehicle.id);
      } else {
        showToast(`Added ${vehicle.make} ${vehicle.model} to Wishlist!`, 'success');
        return [...prev, vehicle];
      }
    });
  };

  // Compare Toggle (Max 3)
  const handleToggleCompare = (vehicle: Vehicle) => {
    setCompareList((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) {
        showToast(`Removed ${vehicle.make} ${vehicle.model} from compare`, 'info');
        return prev.filter((v) => v.id !== vehicle.id);
      } else {
        if (prev.length >= 3) {
          showToast('You can compare a maximum of 3 cars at once', 'error');
          return prev;
        }
        showToast(`Added ${vehicle.make} ${vehicle.model} to Compare Matrix`, 'success');
        return [...prev, vehicle];
      }
    });
  };

  // Optimistic Purchase Action
  const handlePurchaseVehicle = async (vehicleId: string) => {
    const target = vehicles.find((v) => v.id === vehicleId);
    if (!target || target.quantity <= 0) {
      showToast('Vehicle is currently sold out', 'error');
      return;
    }

    // Optimistic decrement
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, quantity: Math.max(0, v.quantity - 1) } : v))
    );

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/vehicles/${vehicleId}/purchase`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purchase failed');

      showToast(`CONGRATULATIONS! PURCHASED ${target.make} ${target.model}!`, 'success');
      fetchVehicles();
    } catch (err: any) {
      fetchVehicles();
      showToast(err.message || 'Purchase error', 'error');
    }
  };

  // Admin Save Vehicle
  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      if (editingVehicle) {
        const res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(vehicleData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed');
        showToast(`UPDATED ${data.make} ${data.model} RECORD`, 'success');
      } else {
        const res = await fetch('/api/vehicles', {
          method: 'POST',
          headers,
          body: JSON.stringify(vehicleData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Creation failed');
        showToast(`ADDED ${data.make} ${data.model} TO INVENTORY`, 'success');
      }

      setIsAddModalOpen(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      showToast(err.message || 'Save error', 'error');
      throw err;
    }
  };

  // Admin Delete Vehicle
  const handleDeleteConfirm = async (vehicleId: string) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      showToast('REMOVED VEHICLE FROM INVENTORY', 'info');
      setDeletingVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Admin Restock Vehicle
  const handleRestockConfirm = async (vehicleId: string, addQuantity: number) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: addQuantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Restock failed');

      showToast(`RESTOCKED +${addQuantity} UNITS SUCCESSFULLY`, 'success');
      setRestockingVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F1B2D]">
      {/* Top Navbar */}
      <Header
        currentView={currentView}
        onNavigateView={(view) => setCurrentView(view)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        compareCount={compareList.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenAuth={onOpenAuth || (() => {})}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {currentView === 'showroom' ? (
          <PublicHomepage
            vehicles={vehicles}
            totalVehicles={totalVehicles}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedMake={selectedMake}
            onMakeChange={setSelectedMake}
            selectedFuel={selectedFuel}
            onFuelChange={setSelectedFuel}
            selectedCondition={selectedCondition}
            onConditionChange={setSelectedCondition}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onSelectVehicle={(v) => {
              setSelectedVehicle(v);
              setIsDetailOpen(true);
            }}
            onPurchase={handlePurchaseVehicle}
            onEdit={(v) => {
              setEditingVehicle(v);
              setIsAddModalOpen(true);
            }}
            onDelete={(v) => setDeletingVehicle(v)}
            onRestock={(v) => setRestockingVehicle(v)}
            wishlistIds={wishlist.map((v) => v.id)}
            onToggleWishlist={handleToggleWishlist}
            compareIds={compareList.map((v) => v.id)}
            onToggleCompare={handleToggleCompare}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <AdminDashboard
            vehicles={vehicles}
            totalVehicles={totalVehicles}
            loading={loading}
            onAddVehicle={() => {
              setEditingVehicle(null);
              setIsAddModalOpen(true);
            }}
            onEditVehicle={(v) => {
              setEditingVehicle(v);
              setIsAddModalOpen(true);
            }}
            onDeleteVehicle={(v) => setDeletingVehicle(v)}
            onRestockVehicle={(v) => setRestockingVehicle(v)}
            onPurchaseVehicle={handlePurchaseVehicle}
            onRefreshData={fetchVehicles}
          />
        )}
      </main>

      {/* Detail Modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedVehicle(null);
        }}
        allVehicles={vehicles}
        onSelectVehicle={(v) => setSelectedVehicle(v)}
        onPurchase={handlePurchaseVehicle}
        onEdit={isAdmin ? (v) => {
          setIsDetailOpen(false);
          setEditingVehicle(v);
          setIsAddModalOpen(true);
        } : undefined}
        isWishlisted={selectedVehicle ? wishlist.some((w) => w.id === selectedVehicle.id) : false}
        onToggleWishlist={handleToggleWishlist}
        isCompared={selectedVehicle ? compareList.some((c) => c.id === selectedVehicle.id) : false}
        onToggleCompare={handleToggleCompare}
      />

      {/* Compare Modal */}
      <CompareModal
        vehicles={compareList}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRemoveVehicle={(id) => setCompareList((prev) => prev.filter((v) => v.id !== id))}
        onClearAll={() => setCompareList([])}
        onPurchase={handlePurchaseVehicle}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        vehicles={wishlist}
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveVehicle={handleToggleWishlist}
        onSelectVehicle={(v) => {
          setSelectedVehicle(v);
          setIsDetailOpen(true);
        }}
        onPurchase={handlePurchaseVehicle}
      />

      {/* Admin Modals */}
      <VehicleFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVehicle(null);
        }}
        onSubmit={handleSaveVehicle}
        initialData={editingVehicle}
      />

      <DeleteModal
        isOpen={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={handleDeleteConfirm}
        vehicle={deletingVehicle}
      />

      <RestockModal
        isOpen={!!restockingVehicle}
        onClose={() => setRestockingVehicle(null)}
        onRestock={handleRestockConfirm}
        vehicle={restockingVehicle}
      />

      {/* Chat Widget Assistant */}
      <ChatWidget />
    </div>
  );
};
