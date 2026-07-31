import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Car, ShieldAlert, ArrowRight, ArrowLeft, ShieldCheck, User } from 'lucide-react';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onReturnToShowroom?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateRegister, onReturnToShowroom, onLoginSuccess }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      showToast(`Welcome back, ${data.user.email}!`, 'success');
      // Navigate back: prefer explicit handler, fallback to onLoginSuccess
      if (onReturnToShowroom) onReturnToShowroom();
      else if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 relative">
      <div className="w-full max-w-md">
        {/* Branding Banner */}
        <div className="brutal-card bg-[#0F1B2D] p-6 mb-6 text-center brutal-shadow-xl border-4 border-[#0F1B2D]">
          <div className="inline-flex items-center justify-center bg-[#FFE500] text-[#0F1B2D] p-3 mb-3 border-3 border-[#0F1B2D] brutal-shadow">
            <Car className="w-8 h-8 stroke-[3px]" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            INCUBYTE MOTORS
          </h1>
          <p className="text-xs font-black uppercase text-slate-300 tracking-wider mt-1">
            CAR DEALERSHIP INVENTORY SYSTEM
          </p>
        </div>

        {/* Login Form Card */}
        <div className="brutal-card bg-white p-6 md:p-8 brutal-shadow-xl border-4 border-[#0F1B2D]">
          <div className="flex items-center justify-between border-b-4 border-[#0F1B2D] pb-3 mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D]">
              SIGN IN TO DEALERSHIP
            </h2>
            {onReturnToShowroom && (
              <button
                type="button"
                onClick={onReturnToShowroom}
                className="text-xs font-black uppercase text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[3px]" />
                SHOWROOM
              </button>
            )}
          </div>

          {/* Preset Buttons for Quick Login */}
          <div className="bg-slate-100 border-2 border-[#0F1B2D] p-3 mb-6">
            <div className="text-[10px] font-black uppercase text-neutral-500 mb-2">
              DEMO CREDENTIAL PRESETS (ONE-CLICK)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@incubytemotors.com', 'AdminPassword123!')}
                className="bg-[#0F1B2D] text-[#FFE500] hover:bg-slate-800 text-[10px] font-extrabold uppercase py-2 border border-[#0F1B2D] flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[3px]" />
                ADMIN PRESET
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('driver@incubytemotors.com', 'UserPassword123!')}
                className="bg-white text-[#0F1B2D] hover:bg-slate-50 text-[10px] font-extrabold uppercase py-2 border border-[#0F1B2D] flex items-center justify-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 stroke-[3px]" />
                CUSTOMER PRESET
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[#DC2626] text-white p-4 border-3 border-[#0F1B2D] font-extrabold text-xs uppercase mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 stroke-[3px] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="EMAIL ADDRESS"
              type="email"
              placeholder="admin@dealership.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="PASSWORD"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="yellow"
              size="lg"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2"
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS INVENTORY SYSTEM'}
              <ArrowRight className="w-5 h-5 stroke-[3px]" />
            </Button>
          </form>

          {/* Footer Navigate */}
          <div className="mt-6 text-center pt-4 border-t-2 border-[#0F1B2D]">
            <span className="text-xs font-bold uppercase text-neutral-500">
              NEED AN ACCOUNT?{' '}
            </span>
            <button
              onClick={onNavigateRegister}
              className="text-xs font-black uppercase text-[#3B82F6] hover:underline cursor-pointer"
            >
              REGISTER HERE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

