
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useSimpleInventory } from './hooks/useSimpleInventory';
import SimpleInventoryControls from './SimpleInventoryControls';
import SimpleInventoryGrid from './SimpleInventoryGrid';
import SimpleInventoryStats from './SimpleInventoryStats';
import { Card } from '@/components/ui/card';
import { RefreshCw, WifiOff, CheckCircle, AlertTriangle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const SimpleInventoryManager = ({ onCreateListing, onBack }: SimpleInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const { listings, loading, error, stats, refetch, usingFallback } = useSimpleInventory({
    searchTerm,
    statusFilter
  });

  console.log('📊 SimpleInventoryManager render:', {
    loading,
    error,
    listingsCount: listings.length,
    stats,
    usingFallback
  });

  const handleRetry = () => {
    console.log('🔄 Manual retry to fetch real data...');
    refetch();
  };

  const hasConnectionError = error && (
    error.includes('timeout') || 
    error.includes('Connection') || 
    error.includes('Unable to load') ||
    error.includes('issues')
  );

  const isLoadingData = error && error.includes('Loading your inventory');

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Manage Inventory"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Show loading state for retry attempts */}
        {isLoadingData && (
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-600 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-800">Loading Your Inventory</h3>
                <p className="text-sm mt-1 text-blue-700">
                  Fetching your real listings data from the database...
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Show connection error */}
        {hasConnectionError && !usingFallback && !isLoadingData && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Database Connection Issues</h3>
                <p className="text-sm mt-1 text-red-700">
                  Unable to load your real inventory data from the database.
                </p>
              </div>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Show fallback notice when using cached real data */}
        {usingFallback && (
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">Using Cached Data</h3>
                <p className="text-sm mt-1 text-yellow-700">
                  Showing previously loaded inventory data due to connection issues.
                </p>
              </div>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </Card>
        )}

        {/* Show success notice when real data loads */}
        {!loading && !error && !usingFallback && listings.length > 0 && (
          <Card className="p-3 border-green-200 bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">
                Real inventory data loaded successfully ({listings.length} items from database)
              </p>
            </div>
          </Card>
        )}

        <SimpleInventoryStats stats={stats} />
        
        <SimpleInventoryControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateListing={onCreateListing}
        />

        <SimpleInventoryGrid
          listings={listings}
          loading={loading}
          error={error}
          onRetry={handleRetry}
          usingFallback={usingFallback}
        />
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="inventory"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Inventory"
        />
      )}
    </div>
  );
};

export default SimpleInventoryManager;
