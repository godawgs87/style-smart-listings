
import React, { useState, useCallback, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
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

interface OptimizedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const OptimizedInventoryManager = ({ onCreateListing, onBack }: OptimizedInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filters = useInventoryFilters([]);
  
  // Memoize inventory query parameters to prevent unnecessary refetches
  const inventoryQueryParams = useMemo(() => ({
    searchTerm: filters.searchTerm.trim() || undefined,
    statusFilter: filters.statusFilter === 'all' ? undefined : filters.statusFilter,
    categoryFilter: filters.categoryFilter === 'all' ? undefined : filters.categoryFilter,
    limit: 30
  }), [filters.searchTerm, filters.statusFilter, filters.categoryFilter]);

  const inventory = useUnifiedInventory(inventoryQueryParams);
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

  const handleUpdateListing = useCallback(async (listingId: string, updates: any) => {
    const success = await operations.updateListing(listingId, updates);
    if (success) {
      setTimeout(() => inventory.refetch(), 1000);
    }
  }, [operations, inventory]);

  const handleDeleteListing = useCallback(async (listingId: string): Promise<void> => {
    const success = await operations.deleteListing(listingId);
    if (success) {
      setSelectedItems(prev => prev.filter(id => id !== listingId));
      setTimeout(() => inventory.refetch(), 1000);
    }
  }, [operations, inventory]);

  const handleDuplicateListing = useCallback(async (listing: any) => {
    const result = await operations.duplicateListing(listing);
    if (result) {
      inventory.refetch();
    }
    return result;
  }, [operations, inventory]);

  const handleRetryWithFilters = useCallback(() => {
    filters.handleClearFilters();
    inventory.refetch();
  }, [filters, inventory]);

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {!inventory.loading && !inventory.error && inventory.listings.length > 0 && (
          <InventoryStatsCards stats={inventory.stats} />
        )}

        {inventory.error && (
          <InventoryErrorSection
            error={inventory.error}
            onRetry={inventory.refetch}
            onClearFilters={handleRetryWithFilters}
            onUseFallback={() => {}}
            onShowDiagnostic={() => {}}
            fallbackDataCount={0}
          />
        )}

        {!inventory.error && (
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
        )}

        {!inventory.loading && !inventory.error && inventory.listings.length > 0 && (
          <OptimisticInventoryTable
            listings={inventory.listings}
            selectedListings={selectedItems}
            onSelectListing={handleSelectListing}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
            onDuplicateListing={handleDuplicateListing}
            useVirtualization={inventory.listings.length > 25}
          />
        )}

        {!inventory.loading && !inventory.error && inventory.listings.length === 0 && (
          <InventoryEmptyState onCreateListing={onCreateListing} />
        )}

        {inventory.loading && (
          <InventoryLoadingState />
        )}
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
};

export default OptimizedInventoryManager;
