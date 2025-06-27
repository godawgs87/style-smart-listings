
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useSimpleInventory } from './hooks/useSimpleInventory';
import SimpleInventoryControls from './SimpleInventoryControls';
import SimpleInventoryGrid from './SimpleInventoryGrid';
import SimpleInventoryStats from './SimpleInventoryStats';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
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
    console.log('🔄 Manual retry triggered...');
    refetch();
  };

  // Show connection issues banner if there are persistent problems
  const showConnectionIssues = error && error.includes('timeout');

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Manage Inventory"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {showConnectionIssues && (
          <Card className="p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-800">Database Connection Issues</h3>
                <p className="text-sm text-orange-700 mt-1">
                  We're experiencing high database load. Try refreshing or check back in a few minutes.
                </p>
              </div>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
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
