
import React, { useState, useCallback, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import UnifiedMobileNavigation from '@/components/UnifiedMobileNavigation';
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';
import { useListingOperations } from '@/hooks/useListingOperations';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import OptimisticInventoryTable from './OptimisticInventoryTable';
import ImprovedInventoryControls from './ImprovedInventoryControls';
import InventoryStatsCards from './InventoryStatsCards';
import InventoryErrorSection from './InventoryErrorSection';
import InventoryEmptyState from './InventoryEmptyState';
import InventoryLoadingState from './InventoryLoadingState';
import ListingDetailView from './ListingDetailView';
import type { Listing } from '@/types/Listing';

interface OptimizedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const OptimizedInventoryManager = ({ onCreateListing, onBack }: OptimizedInventoryManagerProps) => {
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
        setTimeout(() => inventory.refetch(), 500);
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
        setTimeout(() => inventory.refetch(), 500);
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

  // Show loading state
  if (inventory.loading) {
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
            onUseFallback={() => {}}
            onShowDiagnostic={() => {}}
            fallbackDataCount={0}
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

  // Show empty state
  if (!inventory.loading && filteredListings.length === 0 && inventory.listings.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Inventory Manager"
          showBack
          onBack={onBack}
        />
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <ImprovedInventoryControls
            searchTerm={filters.searchTerm}
            statusFilter={filters.statusFilter}
            categoryFilter={filters.categoryFilter}
            categories={filters.categories}
            loading={false}
            selectedCount={0}
            onSearchChange={filters.setSearchTerm}
            onStatusChange={filters.setStatusFilter}
            onCategoryChange={filters.setCategoryFilter}
            onClearFilters={filters.handleClearFilters}
            onRefresh={inventory.refetch}
            onCreateListing={onCreateListing}
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

        <InventoryStatsCards stats={inventory.stats} />

        <ImprovedInventoryControls
          searchTerm={filters.searchTerm}
          statusFilter={filters.statusFilter}
          categoryFilter={filters.categoryFilter}
          categories={filters.categories}
          loading={inventory.loading}
          selectedCount={selectedItems.length}
          onSearchChange={filters.setSearchTerm}
          onStatusChange={filters.setStatusFilter}
          onCategoryChange={filters.setCategoryFilter}
          onClearFilters={filters.handleClearFilters}
          onRefresh={inventory.refetch}
          onCreateListing={onCreateListing}
        />

        <OptimisticInventoryTable
          listings={filteredListings}
          selectedListings={selectedItems}
          onSelectListing={handleSelectListing}
          onSelectAll={handleSelectAll}
          onUpdateListing={handleUpdateListing}
          onDeleteListing={handleDeleteListing}
          onDuplicateListing={handleDuplicateListing}
          onPreviewListing={handlePreviewListing}
          useVirtualization={filteredListings.length > 25}
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

export default OptimizedInventoryManager;
