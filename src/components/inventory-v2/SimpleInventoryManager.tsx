
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useSimpleInventory } from './hooks/useSimpleInventory';
import SimpleInventoryControls from './SimpleInventoryControls';
import SimpleInventoryGrid from './SimpleInventoryGrid';
import SimpleInventoryStats from './SimpleInventoryStats';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Database, WifiOff } from 'lucide-react';
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

  // Enhanced error detection
  const showConnectionIssues = error && (
    error.includes('timeout') || 
    error.includes('Connection') || 
    error.includes('Database') ||
    usingFallback
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Manage Inventory"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Enhanced connection status banner */}
        {showConnectionIssues && (
          <Card className={`p-4 ${usingFallback ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              {usingFallback ? (
                <WifiOff className="w-5 h-5 text-yellow-600" />
              ) : (
                <Database className="w-5 h-5 text-red-600" />
              )}
              <div className="flex-1">
                <h3 className={`font-medium ${usingFallback ? 'text-yellow-800' : 'text-red-800'}`}>
                  {usingFallback ? 'Using Cached Data' : 'Database Connection Issues'}
                </h3>
                <p className={`text-sm mt-1 ${usingFallback ? 'text-yellow-700' : 'text-red-700'}`}>
                  {usingFallback 
                    ? 'Database queries are timing out. Showing previously loaded data.'
                    : 'Database is experiencing high load. This may affect data freshness.'
                  }
                </p>
                {error && (
                  <p className="text-xs mt-1 font-mono text-gray-600">
                    Error: {error}
                  </p>
                )}
              </div>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm"
                className={usingFallback 
                  ? "border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  : "border-red-300 text-red-700 hover:bg-red-100"
                }
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
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
