
import React, { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useListings } from '@/hooks/useListings';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import InventoryManagerHeader from '@/components/inventory/InventoryManagerHeader';
import InventoryContent from '@/components/inventory/InventoryContent';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryControls from '@/components/inventory/InventoryControls';
import BulkActionsBar from '@/components/BulkActionsBar';
import { useInventoryFilters } from '@/components/inventory/InventoryFilters';
import type { Listing } from '@/types/Listing';

interface InventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const InventoryManager = ({ onCreateListing, onBack }: InventoryManagerProps) => {
  const isMobile = useIsMobile();
  const { listings, loading, error, deleteListing, duplicateListing, updateListing, updateListingStatus } = useListings();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [consignmentFilter, setConsignmentFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const { filteredListings } = useInventoryFilters({
    listings,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortBy,
    sourceTypeFilter,
    consignmentFilter,
    priceRangeFilter
  });

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(listings.map(l => l.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [listings]);

  const stats = useMemo(() => {
    const totalItems = listings.length;
    const totalValue = listings.reduce((sum, listing) => sum + (listing.price || 0), 0);
    const profitableListings = listings.filter(l => l.net_profit && l.net_profit > 0);
    const averageProfit = profitableListings.length > 0 
      ? profitableListings.reduce((sum, l) => sum + (l.net_profit || 0), 0) / profitableListings.length 
      : 0;
    const listingsWithDays = listings.filter(l => l.days_to_sell);
    const averageDaysToSell = listingsWithDays.length > 0
      ? listingsWithDays.reduce((sum, l) => sum + (l.days_to_sell || 0), 0) / listingsWithDays.length
      : 0;

    return {
      totalItems,
      totalValue,
      averageProfit,
      averageDaysToSell
    };
  }, [listings]);

  // Enable bulk mode when items are selected
  useEffect(() => {
    setIsBulkMode(selectedItems.length > 0);
  }, [selectedItems]);

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? filteredListings.map(item => item.id) : []);
  };

  const handleDuplicateListing = async (item: Listing) => {
    console.log('Duplicating listing:', item.id);
    const success = await duplicateListing(item);
    if (success) {
      console.log('Listing duplicated successfully');
    }
  };

  const handleBulkDelete = async () => {
    console.log('Bulk deleting items:', selectedItems);
    for (const itemId of selectedItems) {
      await deleteListing(itemId);
    }
    setSelectedItems([]);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    console.log('Bulk updating status:', selectedItems, status);
    for (const itemId of selectedItems) {
      await updateListingStatus(itemId, status);
    }
    setSelectedItems([]);
  };

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

export default InventoryManager;
