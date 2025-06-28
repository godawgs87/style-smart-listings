import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/pages/Dashboard';
import CreateListing from '@/pages/CreateListing';
import DataManagement from '@/pages/DataManagement';
import AuthForm from '@/components/AuthForm';

const App = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'data-management'>('dashboard');
  const { isAuthenticated, isLoading } = useAuth();

  const handleNavigate = (view: 'dashboard' | 'create' | 'listings' | 'inventory' | 'active-listings' | 'data-management') => {
    switch (view) {
      case 'dashboard':
        setCurrentView('dashboard');
        break;
      case 'create':
        setCurrentView('create');
        break;
      case 'listings':
        window.location.href = '/listings';
        break;
      case 'inventory':
        window.location.href = '/inventory';
        break;
      case 'active-listings':
        window.location.href = '/active-listings';
        break;
      case 'data-management':
        setCurrentView('data-management');
        break;
    }
  };

  useEffect(() => {
    if (window.location.pathname === '/create') {
      setCurrentView('create');
    } else {
      setCurrentView('dashboard');
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <AuthForm />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && (
        <Dashboard onNavigate={handleNavigate} />
      )}
      {currentView === 'create' && (
        <CreateListing 
          onBack={() => setCurrentView('dashboard')}
          onViewListings={() => window.location.href = '/inventory'}
        />
      )}
      {currentView === 'data-management' && (
        <DataManagement 
          onBack={() => setCurrentView('dashboard')}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default App;
