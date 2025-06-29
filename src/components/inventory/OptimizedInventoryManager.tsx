
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useStableInventory } from '@/hooks/useStableInventory';
import { useInventoryDiagnostic } from '@/hooks/useInventoryDiagnostic';
import { useListingOperations } from '@/hooks/useListingOperations';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { Card } from '@/components/ui/card';
import OptimisticInventoryTable from './OptimisticInventoryTable';
import ImprovedInventoryControls from './ImprovedInventoryControls';
import ImprovedInventoryErrorBoundary from './ImprovedInventoryErrorBoundary';
import DiagnosticInventoryManager from './DiagnosticInventoryManager';
import { RefreshCw } from 'lucide-react';
import type { Listing } from '@/types/Listing';

interface OptimizedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const OptimizedInventoryManager = ({ onCreateListing, onBack }: OptimizedInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [isStable, setIsStable] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    handleClearFilters
  } = useInventoryFilters([]);

  // Primary inventory hook
  const { 
    listings: primaryListings, 
    loading: primaryLoading, 
    error: primaryError, 
    stats: primaryStats, 
    isRefreshing,
    refetch: primaryRefetch, 
    clearCache 
  } = useStableInventory({
    searchTerm: searchTerm.trim() || undefined,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 30
  });

  // Fallback diagnostic hook - only run when needed
  const { 
    listings: fallbackListings, 
    loading: fallbackLoading, 
    error: fallbackError 
  } = useInventoryDiagnostic();

  // Stabilize the loading state to prevent flashing
  useEffect(() => {
    if (!primaryLoading && !isRefreshing) {
      const timer = setTimeout(() => {
        setHasAttemptedLoad(true);
        setIsStable(true);
      }, 500); // Small delay to prevent flashing
      
      return () => clearTimeout(timer);
    } else {
      setIsStable(false);
    }
  }, [primaryLoading, isRefreshing]);

  // Auto-switch to fallback if primary fails but fallback has data
  useEffect(() => {
    if (hasAttemptedLoad && primaryError && !useFallbackData && fallbackListings.length > 0 && !fallbackError) {
      console.log('🔄 Auto-switching to fallback data due to primary error');
      setUseFallbackData(true);
    }
  }, [hasAttemptedLoad, primaryError, useFallbackData, fallbackListings.length, fallbackError]);

  // Determine which data to use
  const shouldUseFallback = useFallbackData;
  const listings = shouldUseFallback ? fallbackListings : primaryListings;
  const loading = shouldUseFallback ? fallbackLoading : (primaryLoading || !isStable);
  const error = shouldUseFallback ? fallbackError : (isStable ? primaryError : null);
  
  // Calculate stats for fallback data
  const fallbackStats = {
    totalItems: fallbackListings.length,
    totalValue: fallbackListings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: fallbackListings.filter(item => item.status === 'active').length,
    draftItems: fallbackListings.filter(item => item.status === 'draft').length
  };
  
  const stats = shouldUseFallback ? fallbackStats : primaryStats;

  const { deleteListing, updateListing, duplicateListing } = useListingOperations();

  // Show diagnostic mode if explicitly requested
  if (showDiagnostic) {
    return (
      <DiagnosticInventoryManager
        onCreateListing={onCreateListing}
        onBack={() => setShowDiagnostic(false)}
      />
    );
  }

  const handleSelectListing = (listingId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, listingId]
        : prev.filter(id => id !== listingId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? listings.map(l => l.id) : []);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    const success = await updateListing(listingId, updates);
    if (success) {
      if (shouldUseFallback) {
        window.location.reload();
      } else {
        setTimeout(() => primaryRefetch(), 1000);
      }
    }
  };

  const handleDeleteListing = async (listingId: string): Promise<void> => {
    const success = await deleteListing(listingId);
    if (success) {
      setSelectedItems(prev => prev.filter(id => id !== listingId));
      if (shouldUseFallback) {
        window.location.reload();
      } else {
        setTimeout(() => primaryRefetch(), 1000);
      }
    }
  };

  const handleDuplicateListing = async (listing: any) => {
    const result = await duplicateListing(listing);
    if (result) {
      if (shouldUseFallback) {
        window.location.reload();
      } else {
        primaryRefetch();
      }
    }
    return result;
  };

  const handleRetryWithFilters = () => {
    handleClearFilters();
    clearCache();
    setUseFallbackData(false);
    setHasAttemptedLoad(false);
    setIsStable(false);
    primaryRefetch();
  };

  const handleUseFallback = () => {
    setUseFallbackData(true);
  };

  const handleRetryPrimary = () => {
    setUseFallbackData(false);
    setHasAttemptedLoad(false);
    setIsStable(false);
    clearCache();
    primaryRefetch();
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Fallback Data Notice */}
        {shouldUseFallback && (
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-800 font-medium">Using Diagnostic Data</div>
                <div className="text-blue-700 text-sm">Switched to fallback data source due to loading issues</div>
              </div>
              <Button onClick={handleRetryPrimary} variant="outline" size="sm">
                Try Primary Again
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards - only show when not loading and have data */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
                <div className="text-sm text-blue-700">Total Items</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(0)}</div>
                <div className="text-sm text-green-700">Total Value</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.activeItems}</div>
                <div className="text-sm text-purple-700">Active</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.draftItems}</div>
                <div className="text-sm text-orange-700">Drafts</div>
              </div>
            </Card>
          </div>
        )}

        {/* Refresh Status */}
        {isRefreshing && !shouldUseFallback && (
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-blue-800">Refreshing inventory...</span>
            </div>
          </Card>
        )}

        {/* Error Handling - only show when stable and has error */}
        {error && isStable && !shouldUseFallback && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="space-y-4">
              <ImprovedInventoryErrorBoundary 
                error={error} 
                onRetry={primaryRefetch}
                onClearFilters={handleRetryWithFilters}
              />
              
              {fallbackListings.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-700 mb-2">
                    We found {fallbackListings.length} items using an alternative method.
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUseFallback} variant="outline" size="sm">
                      Use Available Data
                    </Button>
                    <Button onClick={() => setShowDiagnostic(true)} variant="outline" size="sm">
                      Show Diagnostics
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Controls - only show if no error or using fallback */}
        {(!error || shouldUseFallback) && (
          <ImprovedInventoryControls
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            categories={categories}
            loading={loading}
            selectedCount={selectedItems.length}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onCategoryChange={setCategoryFilter}
            onClearFilters={handleClearFilters}
            onRefresh={shouldUseFallback ? () => window.location.reload() : primaryRefetch}
            onCreateListing={onCreateListing}
          />
        )}

        {/* Table - only show if data loaded successfully */}
        {!loading && (!error || shouldUseFallback) && listings.length > 0 && (
          <OptimisticInventoryTable
            listings={listings}
            selectedListings={selectedItems}
            onSelectListing={handleSelectListing}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
            onDuplicateListing={handleDuplicateListing}
            useVirtualization={listings.length > 25}
          />
        )}

        {/* Empty State */}
        {!loading && (!error || shouldUseFallback) && listings.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500 mb-4">No inventory items found</div>
            <Button onClick={onCreateListing}>
              Create Your First Item
            </Button>
          </Card>
        )}

        {/* Loading State - simplified to prevent flashing */}
        {loading && (
          <Card className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <div className="text-gray-500">Loading inventory...</div>
            </div>
          </Card>
        )}
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

export default OptimizedInventoryManager;
