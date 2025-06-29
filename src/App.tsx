
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import CreateListing from '@/pages/CreateListing';
import DataManagement from '@/pages/DataManagement';
import UserSettings from '@/pages/UserSettings';
import SimpleInventoryPage from '@/pages/SimpleInventoryPage';
import ActiveListingsPage from '@/pages/ActiveListingsPage';
import LoadingState from '@/components/LoadingState';
import SafeErrorBoundary from '@/components/SafeErrorBoundary';

const App = () => {
  const { user, loading } = useAuth();

  console.log('App render - loading:', loading, 'user:', !!user);

  if (loading) {
    return <LoadingState message="Initializing..." fullPage />;
  }

  return (
    <SafeErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={user ? <SimpleInventoryPage /> : <Index />} />
            <Route path="/create" element={user ? <CreateListing onBack={() => window.location.href = '/'} onViewListings={() => window.location.href = '/inventory'} /> : <Index />} />
            <Route path="/active-listings" element={user ? <ActiveListingsPage onBack={() => window.location.href = '/'} /> : <Index />} />
            <Route path="/data-management" element={user ? <DataManagement onBack={() => window.location.href = '/'} onNavigate={(view) => window.location.href = `/${view}`} /> : <Index />} />
            <Route path="/settings" element={user ? <UserSettings /> : <Index />} />
            <Route path="*" element={<Index />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </SafeErrorBoundary>
  );
};

export default App;
