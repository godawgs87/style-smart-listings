
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
  
  const inventoryQueryParams = useMemo(() => ({
    searchTerm: filters.searchTerm.trim() || undefined,
    statusFilter: filters.statusFilter === 'all' ? undefined : filters.statusFilter,
    categoryFilter: filters.categoryFilter === 'all' ? undefined : filters.categoryFilter,
    limit: 50
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
    try {
      const success = await operations.updateListing(listingId, updates);
      if (success) {
        setTimeout(() => inventory.refetch(), 500);
      }
      return success;
    } catch (error) {
      console.error('Failed to update listing:', error);
      return false;
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

  const handleRetryWithFilters = useCallback(() => {
    filters.handleClearFilters();
    inventory.refetch();
  }, [filters, inventory]);

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

  // Show error state
  if (inventory.error) {
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
  if (!inventory.loading && inventory.listings.length === 0) {
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
          listings={inventory.listings}
          selectedListings={selectedItems}
          onSelectListing={handleSelectListing}
          onSelectAll={handleSelectAll}
          onUpdateListing={handleUpdateListing}
          onDeleteListing={handleDeleteListing}
          onDuplicateListing={handleDuplicateListing}
          useVirtualization={inventory.listings.length > 25}
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
};

export default OptimizedInventoryManager;
