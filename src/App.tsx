import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

const MainContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [authOverlay, setAuthOverlay] = useState<'none' | 'login' | 'register'>('none');

  if (authOverlay === 'login') {
    return (
      <LoginPage
        onNavigateRegister={() => setAuthOverlay('register')}
        onLoginSuccess={() => setAuthOverlay('none')}
      />
    );
  }

  if (authOverlay === 'register') {
    return <RegisterPage onNavigateLogin={() => setAuthOverlay('login')} />;
  }

  return (
    <DashboardPage onOpenAuth={() => setAuthOverlay('login')} />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainContent />
      </ToastProvider>
    </AuthProvider>
  );
}

