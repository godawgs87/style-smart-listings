
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, List, Package, Settings, BarChart3 } from "lucide-react";
import CreateListing from "./CreateListing";
import ListingsManager from "./ListingsManager";
import AuthForm from "@/components/AuthForm";
import StreamlinedHeader from "@/components/StreamlinedHeader";
import EnhancedMobileNavigation from "@/components/EnhancedMobileNavigation";
import LoadingState from "@/components/LoadingState";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'inventory' | 'active-listings'>('dashboard');
  const [pageLoading, setPageLoading] = useState(false);
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  // Handle URL-based navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') as 'dashboard' | 'create' | 'inventory' | 'active-listings';
    if (view && ['dashboard', 'create', 'inventory', 'active-listings'].includes(view)) {
      setCurrentView(view);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleInventoryClick = () => {
    setPageLoading(true);
    window.location.href = '/inventory';
  };

  const handleActiveListingsClick = () => {
    setPageLoading(true);
    window.location.href = '/active-listings';
  };

  const handleNavigation = (view: 'dashboard' | 'create' | 'inventory' | 'active-listings') => {
    if (view === 'inventory') {
      handleInventoryClick();
    } else if (view === 'active-listings') {
      handleActiveListingsClick();
    } else {
      setPageLoading(true);
      setTimeout(() => {
        setCurrentView(view);
        setPageLoading(false);
      }, 200);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your workspace..." fullPage />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <AuthForm onAuthSuccess={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <CreateListing 
        onBack={() => handleNavigation('dashboard')}
        onViewListings={handleInventoryClick}
      />
    );
  }

  if (currentView === 'inventory') {
    handleInventoryClick();
    return <LoadingState message="Loading inventory..." fullPage />;
  }

  if (currentView === 'active-listings') {
    handleActiveListingsClick();
    return <LoadingState message="Loading sales operations..." fullPage />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Hustly"
        userEmail={user.email}
        loading={pageLoading}
        notifications={{
          inventory: 3,
          listings: 1
        }}
      />

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Your Reseller Business Hub
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage inventory, create listings, track profits, and grow your reselling business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                onClick={() => handleNavigation('create')}>
            <div className="text-center">
              <Camera className="w-12 md:w-16 h-12 md:h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Create Listing</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base">
                Upload photos and create professional listings with AI assistance.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Creating</Button>
            </div>
          </Card>

          <Card className="p-6 md:p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                onClick={handleInventoryClick}>
            <div className="text-center">
              <Package className="w-12 md:w-16 h-12 md:h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Inventory Manager</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base">
                Track purchases, calculate profits, and manage your reseller inventory.
              </p>
              <Button variant="outline" className="w-full hover:bg-green-50">Manage Inventory</Button>
            </div>
          </Card>

          <Card className="p-6 md:p-8 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                onClick={() => handleActiveListingsClick()}>
            <div className="text-center">
              <BarChart3 className="w-12 md:w-16 h-12 md:h-16 mx-auto text-orange-600 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Sales Operations</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base">
                Monitor active listings, track performance, and optimize sales.
              </p>
              <Button variant="outline" className="w-full hover:bg-orange-50">View Operations</Button>
            </div>
          </Card>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 md:p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">How Hustly works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>1. Track Inventory:</strong> Log purchases with cost basis, source, and photos
            </div>
            <div>
              <strong>2. Create Listings:</strong> AI-powered descriptions and optimized pricing
            </div>
            <div>
              <strong>3. Monitor Sales:</strong> Track active listings and optimize performance
            </div>
          </div>
        </div>
      </div>

      {isMobile && (
        <EnhancedMobileNavigation
          currentView={currentView}
          onNavigate={handleNavigation}
          loading={pageLoading}
          notifications={{
            inventory: 3,
            listings: 1
          }}
        />
      )}
    </div>
  );
};

export default Index;
