
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import InventoryContent from '@/components/inventory/InventoryContent';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryControls from '@/components/inventory/InventoryControls';
import BulkActionsBar from '@/components/BulkActionsBar';
import LoadMoreButton from '@/components/inventory/LoadMoreButton';
import InventoryTimeoutError from '@/components/inventory/InventoryTimeoutError';
import { useInventoryManager } from '@/hooks/useInventoryManager';
import { useInventoryActions } from '@/components/inventory/InventoryActions';

interface InventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const InventoryManager = ({ onCreateListing, onBack }: InventoryManagerProps) => {
  const isMobile = useIsMobile();
  const {
    // Data
    filteredListings,
    categories,
    stats,
    loading,
    error,
    
    // Progressive loading
    canLoadMore,
    isLoadingMore,
    currentLimit,
    handleLoadMore,
    
    // State
    searchTerm,
    statusFilter,
    categoryFilter,
    sourceTypeFilter,
    consignmentFilter,
    sortBy,
    viewMode,
    selectedItems,
    isBulkMode,
    
    // State setters
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setSourceTypeFilter,
    setConsignmentFilter,
    setSortBy,
    setViewMode,
    
    // Handlers
    handleSelectItem,
    handleSelectAll,
    clearSelection,
    
    // Operations
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus,
    refetch
  } = useInventoryManager();

  const { handleDuplicateListing, handleBulkDelete, handleBulkStatusUpdate } = useInventoryActions({
    duplicateListing,
    deleteListing,
    updateListingStatus,
    selectedItems,
    clearSelection
  });

  // Show timeout-specific error state
  if (error && error.includes('timeout')) {
    return <InventoryTimeoutError onBack={onBack} onRetry={refetch} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4">
        <InventoryStats {...stats} />
        
        <InventoryControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          sourceTypeFilter={sourceTypeFilter}
          onSourceTypeFilterChange={setSourceTypeFilter}
          consignmentFilter={consignmentFilter}
          onConsignmentFilterChange={setConsignmentFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateListing={onCreateListing}
          categories={categories}
        />

        {selectedItems.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedItems.length}
            onBulkDelete={handleBulkDelete}
            onBulkStatusUpdate={handleBulkStatusUpdate}
          />
        )}
        
        <InventoryContent
          viewMode={viewMode}
          filteredListings={filteredListings}
          selectedItems={selectedItems}
          isBulkMode={isBulkMode}
          loading={loading}
          error={error}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          onUpdateListing={updateListing}
          onDeleteListing={deleteListing}
          onDuplicateListing={handleDuplicateListing}
          onRetry={refetch}
        />

        {/* Progressive loading button */}
        {!loading && !error && filteredListings.length > 0 && (
          <LoadMoreButton
            onLoadMore={handleLoadMore}
            isLoading={isLoadingMore}
            canLoadMore={canLoadMore}
            currentCount={filteredListings.length}
          />
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

export default InventoryManager;
