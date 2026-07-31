import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Car, UserPlus, ShieldAlert, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onNavigateLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateLogin }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.token, data.user);
      showToast('Account created successfully!', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="brutal-card bg-[#0F1B2D] p-6 mb-6 text-center brutal-shadow-xl border-4 border-[#0F1B2D]">
          <div className="inline-flex items-center justify-center bg-[#10B981] text-white p-3 mb-3 border-3 border-[#0F1B2D] brutal-shadow">
            <UserPlus className="w-8 h-8 stroke-[3px]" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            CREATE ACCOUNT
          </h1>
          <p className="text-xs font-black uppercase text-slate-300 tracking-wider mt-1">
            JOIN INCUBYTE MOTORS DEALERSHIP
          </p>
        </div>

        {/* Register Form Card */}
        <div className="brutal-card bg-white p-6 md:p-8 brutal-shadow-xl">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] mb-6 border-b-4 border-[#0F1B2D] pb-3">
            NEW USER REGISTRATION
          </h2>

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
              placeholder="newdriver@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="PASSWORD (MIN 6 CHARACTERS)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="CONFIRM PASSWORD"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="green"
              size="lg"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'}
            </Button>
          </form>

          {/* Footer Navigate */}
          <div className="mt-6 text-center pt-4 border-t-2 border-[#0F1B2D]">
            <button
              onClick={onNavigateLogin}
              className="inline-flex items-center gap-1 text-xs font-black uppercase text-[#3B82F6] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3px]" />
              BACK TO LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
