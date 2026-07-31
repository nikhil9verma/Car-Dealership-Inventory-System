import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { Badge } from './Badge';
import {
  Car,
  ShieldCheck,
  Heart,
  Scale,
  LogOut,
  LogIn,
  User,
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'showroom' | 'admin';
  onNavigateView: (view: 'showroom' | 'admin') => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateView,
  wishlistCount,
  onOpenWishlist,
  compareCount,
  onOpenCompare,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="bg-[#0F1B2D] text-white border-b-4 border-[#0F1B2D] sticky top-0 z-40 brutal-shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo & Brand Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateView('showroom')}>
          <div className="bg-[#FFE500] text-[#0F1B2D] p-2 border-2 border-[#FFE500] brutal-shadow-sm font-black flex items-center justify-center">
            <Car className="w-6 h-6 stroke-[3px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-none">
                INCUBYTE <span className="text-[#FFE500]">MOTORS</span>
              </span>
              <Badge variant="green" className="text-[10px]">VERIFIED</Badge>
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest mt-0.5">
              PREMIUM AUTOMOTIVE INVENTORY SYSTEM
            </div>
          </div>
        </div>

        {/* View Modes Switcher: Showroom vs Admin */}
        <div className="flex items-center gap-2 bg-slate-900 border-2 border-slate-700 p-1">
          <button
            onClick={() => onNavigateView('showroom')}
            className={`px-3 py-1.5 font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'showroom'
                ? 'bg-[#FFE500] text-[#0F1B2D] border-2 border-[#0F1B2D] brutal-shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 stroke-[3px]" />
            SHOWROOM
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigateView('admin')}
              className={`px-3 py-1.5 font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#FFE500] text-[#0F1B2D] border-2 border-[#0F1B2D] brutal-shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 stroke-[3px]" />
              ADMIN DASHBOARD
            </button>
          )}
        </div>

        {/* Action Controls: Wishlist, Compare & Auth State */}
        <div className="flex items-center gap-2">
          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="bg-slate-800 hover:bg-slate-700 text-white p-2 border-2 border-slate-600 flex items-center gap-1.5 text-xs font-black font-mono transition-colors cursor-pointer relative"
            title="Open Wishlist"
          >
            <Heart className="w-4 h-4 text-red-400 fill-current stroke-[3px]" />
            <span className="hidden sm:inline">SAVED</span>
            {wishlistCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 font-mono font-bold border border-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Compare Button */}
          <button
            onClick={onOpenCompare}
            className="bg-slate-800 hover:bg-slate-700 text-white p-2 border-2 border-slate-600 flex items-center gap-1.5 text-xs font-black font-mono transition-colors cursor-pointer relative"
            title="Open Comparison Matrix"
          >
            <Scale className="w-4 h-4 text-[#FFE500] stroke-[3px]" />
            <span className="hidden sm:inline">COMPARE</span>
            {compareCount > 0 && (
              <span className="bg-[#FFE500] text-[#0F1B2D] text-[10px] px-1.5 py-0.2 font-mono font-black border border-[#0F1B2D]">
                {compareCount}
              </span>
            )}
          </button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l-2 border-slate-700">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-black uppercase text-[#FFE500]">
                  {user?.username}
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">
                  {user?.role}
                </span>
              </div>
              <Button
                variant="white"
                size="sm"
                onClick={logout}
                className="flex items-center gap-1 text-xs"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[3px]" />
                LOGOUT
              </Button>
            </div>
          ) : (
            <Button
              variant="yellow"
              size="sm"
              onClick={onOpenAuth}
              className="flex items-center gap-1 text-xs"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[3px]" />
              ADMIN / LOGIN
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
