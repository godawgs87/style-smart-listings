import React, { useState, useCallback, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import UnifiedMobileNavigation from '@/components/UnifiedMobileNavigation';
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';
import { useListingOperations } from '@/hooks/useListingOperations';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import OptimisticInventoryTableView from './OptimisticInventoryTableView';
import InventoryControls from './InventoryControls';
import InventoryStatsCards from './InventoryStatsCards';
import InventoryErrorSection from './InventoryErrorSection';
import InventoryEmptyState from './InventoryEmptyState';
import InventoryLoadingState from './InventoryLoadingState';
import ListingDetailView from './ListingDetailView';
import type { Listing } from '@/types/Listing';

interface InventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const InventoryManager = ({ onCreateListing, onBack }: InventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);

  const inventoryQueryParams = useMemo(() => ({
    limit: 50 // Reasonable limit for inventory
  }), []);

  const inventory = useUnifiedInventory(inventoryQueryParams);
  
  // Initialize filters with actual listings data for categories
  const filters = useInventoryFilters(inventory.listings);
  
  const operations = useListingOperations();

  const handleSelectListing = useCallback((listingId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, listingId]
        : prev.filter(id => id !== listingId)
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedItems(checked ? inventory.listings.map(l => l.id) : []);
  }, [inventory.listings]);

  const handleUpdateListing = useCallback(async (listingId: string, updates: any): Promise<void> => {
    try {
      const success = await operations.updateListing(listingId, updates);
      if (success) {
        inventory.refetch();
      }
    } catch (error) {
      console.error('Failed to update listing:', error);
      throw error;
    }
  }, [operations, inventory]);

  const handleDeleteListing = useCallback(async (listingId: string): Promise<void> => {
    try {
      const success = await operations.deleteListing(listingId);
      if (success) {
        setSelectedItems(prev => prev.filter(id => id !== listingId));
        inventory.refetch();
      }
    } catch (error) {
      console.error('Failed to delete listing:', error);
      throw error;
    }
  }, [operations, inventory]);

  const handleDuplicateListing = useCallback(async (listing: any) => {
    try {
      const result = await operations.duplicateListing(listing);
      if (result) {
        inventory.refetch();
      }
      return result;
    } catch (error) {
      console.error('Failed to duplicate listing:', error);
      return null;
    }
  }, [operations, inventory]);

  const handlePreviewListing = useCallback((listing: Listing) => {
    setPreviewListing(listing);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewListing(null);
  }, []);

  const handleRetryWithFilters = useCallback(() => {
    filters.handleClearFilters();
    inventory.refetch();
  }, [filters, inventory]);

  // Filter listings based on current filter state
  const filteredListings = useMemo(() => {
    let filtered = inventory.listings;

    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.title?.toLowerCase().includes(searchLower) ||
        listing.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.statusFilter && filters.statusFilter !== 'all') {
      filtered = filtered.filter(listing => listing.status === filters.statusFilter);
    }

    if (filters.categoryFilter && filters.categoryFilter !== 'all') {
      filtered = filtered.filter(listing => listing.category === filters.categoryFilter);
    }

    return filtered;
  }, [inventory.listings, filters.searchTerm, filters.statusFilter, filters.categoryFilter]);

  // Show loading state only when actually loading and no data
  if (inventory.loading && inventory.listings.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Inventory Manager"
          showBack
          onBack={onBack}
        />
        <div className="max-w-7xl mx-auto p-4">
          <InventoryLoadingState />
        </div>
        {isMobile && (
          <UnifiedMobileNavigation
            currentView="inventory"
            onNavigate={() => {}}
            showBack
            onBack={onBack}
            title="Inventory"
          />
        )}
      </div>
    );
  }

  // Show error state (but not if we're using fallback data)
  if (inventory.error && !inventory.usingFallback) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Inventory Manager"
          showBack
          onBack={onBack}
        />
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <InventoryErrorSection
            error={inventory.error}
            onRetry={inventory.refetch}
            onClearFilters={handleRetryWithFilters}
          />
        </div>
        {isMobile && (
          <UnifiedMobileNavigation
            currentView="inventory"
            onNavigate={() => {}}
            showBack
            onBack={onBack}
            title="Inventory"
          />
        )}
      </div>
    );
  }

  // Show empty state only when not loading and no data
  if (!inventory.loading && filteredListings.length === 0 && inventory.listings.length === 0 && !inventory.error) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Inventory Manager"
          showBack
          onBack={onBack}
        />
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <InventoryControls
            searchTerm={filters.searchTerm}
            statusFilter={filters.statusFilter}
            categoryFilter={filters.categoryFilter}
            categories={filters.categories}
            loading={false}
            selectedCount={0}
            selectedItems={[]}
            onSearchChange={filters.setSearchTerm}
            onStatusChange={filters.setStatusFilter}
            onCategoryChange={filters.setCategoryFilter}
            onClearFilters={filters.handleClearFilters}
            onRefresh={inventory.refetch}
            onCreateListing={onCreateListing}
            onSyncComplete={inventory.refetch}
          />
          <InventoryEmptyState onCreateListing={onCreateListing} />
        </div>
        {isMobile && (
          <UnifiedMobileNavigation
            currentView="inventory"
            onNavigate={() => {}}
            showBack
            onBack={onBack}
            title="Inventory"
          />
        )}
      </div>
    );
  }

  // Show main content
  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Show fallback warning if using cached data */}
        {inventory.usingFallback && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Cached Data
              </Badge>
              <span className="text-yellow-800 text-sm">
                Showing cached inventory due to connection timeout. Data may not be current.
              </span>
            </div>
          </div>
        )}

        {/* Show loading indicator when refreshing */}
        {inventory.loading && inventory.listings.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-800 text-sm">Refreshing inventory...</span>
            </div>
          </div>
        )}

        <InventoryStatsCards stats={inventory.stats} />

        <InventoryControls
          searchTerm={filters.searchTerm}
          statusFilter={filters.statusFilter}
          categoryFilter={filters.categoryFilter}
          categories={filters.categories}
          loading={inventory.loading}
          selectedCount={selectedItems.length}
          selectedItems={selectedItems}
          onSearchChange={filters.setSearchTerm}
          onStatusChange={filters.setStatusFilter}
          onCategoryChange={filters.setCategoryFilter}
          onClearFilters={filters.handleClearFilters}
          onRefresh={inventory.refetch}
          onCreateListing={onCreateListing}
          onSyncComplete={inventory.refetch}
        />

        <OptimisticInventoryTableView
          listings={filteredListings}
          selectedListings={selectedItems}
          onSelectListing={handleSelectListing}
          onSelectAll={handleSelectAll}
          onUpdateListing={handleUpdateListing}
          onDeleteListing={handleDeleteListing}
          onDuplicateListing={handleDuplicateListing}
          onPreviewListing={handlePreviewListing}
        />
      </div>

      {isMobile && (
        <UnifiedMobileNavigation
          currentView="inventory"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Inventory"
        />
      )}

      {previewListing && (
        <ListingDetailView
          listing={previewListing}
          onClose={handleClosePreview}
          onEdit={() => {
            console.log('Edit listing:', previewListing.id);
          }}
        />
      )}
    </div>
  );
};

export default InventoryManager;