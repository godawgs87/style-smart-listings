
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useOptimizedInventory } from '@/hooks/useOptimizedInventory';
import { useListingOperations } from '@/hooks/useListingOperations';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { Card } from '@/components/ui/card';
import OptimisticInventoryTable from './OptimisticInventoryTable';
import ImprovedInventoryControls from './ImprovedInventoryControls';
import ImprovedInventoryErrorBoundary from './ImprovedInventoryErrorBoundary';
import { RefreshCw, Trash2 } from 'lucide-react';
import type { Listing } from '@/types/Listing';

interface OptimizedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const OptimizedInventoryManager = ({ onCreateListing, onBack }: OptimizedInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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

  const { 
    listings, 
    loading, 
    error, 
    stats, 
    isUsingCache, 
    refetch, 
    clearCache 
  } = useOptimizedInventory({
    searchTerm: searchTerm.trim() || undefined,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 75
  });

  const { deleteListing, updateListing, duplicateListing } = useListingOperations();

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
      setTimeout(() => refetch(), 500);
    }
  };

  const handleDeleteListing = async (listingId: string): Promise<void> => {
    const success = await deleteListing(listingId);
    if (success) {
      setSelectedItems(prev => prev.filter(id => id !== listingId));
      setTimeout(() => refetch(), 1000);
    }
  };

  const handleDuplicateListing = async (listing: any) => {
    const result = await duplicateListing(listing);
    if (result) {
      refetch();
    }
    return result;
  };

  const handleClearCacheAndRefresh = () => {
    clearCache();
    refetch();
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
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

        {/* Cache Status */}
        {isUsingCache && (
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div className="text-yellow-800 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Using cached data due to connection issues
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={refetch} 
                  variant="outline" 
                  size="sm"
                  className="text-yellow-700 border-yellow-300"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Try Fresh Data
                </Button>
                <Button 
                  onClick={handleClearCacheAndRefresh} 
                  variant="outline" 
                  size="sm"
                  className="text-yellow-700 border-yellow-300"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Controls */}
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
          onRefresh={refetch}
          onCreateListing={onCreateListing}
        />

        {/* Error Handling */}
        {error && (
          <ImprovedInventoryErrorBoundary 
            error={error} 
            onRetry={refetch}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Table */}
        {!loading && !error && (
          <OptimisticInventoryTable
            listings={listings}
            selectedListings={selectedItems}
            onSelectListing={handleSelectListing}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
            onDuplicateListing={handleDuplicateListing}
            useVirtualization={listings.length > 50}
          />
        )}

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
