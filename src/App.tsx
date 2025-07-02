
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import AuthWrapper from '@/components/wrappers/AuthWrapper';
import CreateListingWrapper from '@/components/wrappers/CreateListingWrapper';
import DataManagementWrapper from '@/components/wrappers/DataManagementWrapper';
import UserSettings from '@/pages/UserSettings';
import SimpleInventoryPage from '@/pages/SimpleInventoryPage';
import ActiveListingsWrapper from '@/components/wrappers/ActiveListingsWrapper';
import EbayCallback from '@/pages/EbayCallback';
import SafeErrorBoundary from '@/components/SafeErrorBoundary';

const App = () => {
  return (
    <SafeErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthWrapper />} />
            <Route path="/inventory" element={<SimpleInventoryPage />} />
            <Route path="/create" element={<CreateListingWrapper />} />
            <Route path="/active-listings" element={<ActiveListingsWrapper />} />
            <Route path="/data-management" element={<DataManagementWrapper />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/ebay/callback" element={<EbayCallback />} />
            <Route path="*" element={<Index />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </SafeErrorBoundary>
  );
};

export default App;
