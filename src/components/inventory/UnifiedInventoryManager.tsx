
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';
import { useListingOperations } from '@/hooks/useListingOperations';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { Card } from '@/components/ui/card';
import ListingDetailView from './ListingDetailView';
import InventoryErrorBoundary from './InventoryErrorBoundary';
import OptimisticInventoryTable from './OptimisticInventoryTable';
import ImprovedInventoryControls from './ImprovedInventoryControls';

interface UnifiedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const UnifiedInventoryManager = ({ onCreateListing, onBack }: UnifiedInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewingListingId, setViewingListingId] = useState<string | null>(null);
  
  const { listings, loading, error, stats, refetch, usingFallback } = useUnifiedInventory({
    limit: 25
  });

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    handleClearFilters
  } = useInventoryFilters(listings);

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
      // Only refetch if we need fresh data, otherwise rely on optimistic updates
      setTimeout(() => refetch(), 500);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    const success = await deleteListing(listingId);
    if (success) {
      setSelectedItems(prev => prev.filter(id => id !== listingId));
      // Delayed refetch to sync with server
      setTimeout(() => refetch(), 1000);
    }
    return success;
  };

  const handlePreviewListing = (listing: any) => {
    setViewingListingId(listing.id);
  };

  const handleDuplicateListing = async (listing: any) => {
    const result = await duplicateListing(listing);
    if (result) {
      refetch();
    }
    return result;
  };

  // If viewing a specific listing, show the detail view
  if (viewingListingId) {
    return (
      <ListingDetailView
        listingId={viewingListingId}
        onBack={() => setViewingListingId(null)}
        onDuplicated={refetch}
        onDeleted={refetch}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-blue-700">Total Items</div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</div>
            <div className="text-sm text-green-700">Total Value</div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{stats.activeItems}</div>
            <div className="text-sm text-purple-700">Active</div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{stats.draftItems}</div>
            <div className="text-sm text-orange-700">Drafts</div>
          </Card>
        </div>

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

        {/* Status Messages */}
        {usingFallback && (
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="text-yellow-800 flex items-center justify-between">
              <span>Using cached data due to connection issues.</span>
              <Button onClick={refetch} variant="link" className="ml-2 p-0 h-auto text-yellow-600">
                Try again
              </Button>
            </div>
          </Card>
        )}

        {/* Error Handling */}
        {error && (
          <InventoryErrorBoundary 
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
            onPreviewListing={handlePreviewListing}
            onDuplicateListing={handleDuplicateListing}
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

export default UnifiedInventoryManager;
