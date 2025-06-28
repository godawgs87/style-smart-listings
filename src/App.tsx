
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import CreateListing from '@/pages/CreateListing';
import DataManagement from '@/pages/DataManagement';
import SimpleInventoryPage from '@/pages/SimpleInventoryPage';
import ActiveListingsPage from '@/pages/ActiveListingsPage';
import AuthForm from '@/components/AuthForm';
import LoadingState from '@/components/LoadingState';
import SafeErrorBoundary from '@/components/SafeErrorBoundary';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading your workspace..." fullPage />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <AuthForm onAuthSuccess={() => window.location.reload()} />
        <Toaster />
      </div>
    );
  }

  return (
    <SafeErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={<SimpleInventoryPage />} />
            <Route path="/create" element={<CreateListing onBack={() => window.location.href = '/'} onViewListings={() => window.location.href = '/inventory'} />} />
            <Route path="/active-listings" element={<ActiveListingsPage onBack={() => window.location.href = '/'} />} />
            <Route path="/data-management" element={<DataManagement onBack={() => window.location.href = '/'} onNavigate={(view) => window.location.href = `/${view}`} />} />
            <Route path="*" element={<Index />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </SafeErrorBoundary>
  );
};

export default App;
