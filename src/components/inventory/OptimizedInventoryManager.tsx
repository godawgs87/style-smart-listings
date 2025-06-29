
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useListingOperations } from '@/hooks/useListingOperations';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import OptimisticInventoryTable from './OptimisticInventoryTable';
import ImprovedInventoryControls from './ImprovedInventoryControls';
import InventoryStatsCards from './InventoryStatsCards';
import InventoryErrorSection from './InventoryErrorSection';
import InventoryEmptyState from './InventoryEmptyState';
import InventoryLoadingState from './InventoryLoadingState';
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

  // Single inventory hook
  const { 
    listings, 
    loading, 
    error, 
    stats, 
    refetch 
  } = useInventoryData({
    searchTerm: searchTerm.trim() || undefined,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 30
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
      setTimeout(() => refetch(), 1000);
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

  const handleRetryWithFilters = () => {
    handleClearFilters();
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
        {/* Stats Cards - only show when loaded and have data */}
        {!loading && !error && listings.length > 0 && (
          <InventoryStatsCards stats={stats} />
        )}

        {/* Error Handling */}
        {error && (
          <InventoryErrorSection
            error={error}
            onRetry={refetch}
            onClearFilters={handleRetryWithFilters}
            onUseFallback={() => {}}
            onShowDiagnostic={() => {}}
            fallbackDataCount={0}
          />
        )}

        {/* Controls - only show if not in error state */}
        {!error && (
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
        )}

        {/* Table - only show if loaded successfully */}
        {!loading && !error && listings.length > 0 && (
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
        {!loading && !error && listings.length === 0 && (
          <InventoryEmptyState onCreateListing={onCreateListing} />
        )}

        {/* Loading State */}
        {loading && (
          <InventoryLoadingState />
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
