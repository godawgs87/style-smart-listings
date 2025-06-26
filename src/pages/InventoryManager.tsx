import React, { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useListings } from '@/hooks/useListings';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import InventoryManagerHeader from '@/components/inventory/InventoryManagerHeader';
import InventoryContent from '@/components/inventory/InventoryContent';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryControls from '@/components/inventory/InventoryControls';
import InventoryFilters from '@/components/inventory/InventoryFilters';

interface InventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const InventoryManager = ({ onCreateListing, onBack }: InventoryManagerProps) => {
  const isMobile = useIsMobile();
  const { listings, loading, error, deleteListing, updateListing } = useListings();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [consignmentFilter, setConsignmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredAndSortedListings = useMemo(() => {
    return InventoryFilters.filterAndSortListings(
      listings, 
      searchTerm, 
      statusFilter, 
      categoryFilter,
      sourceTypeFilter,
      consignmentFilter,
      sortBy
    );
  }, [listings, searchTerm, statusFilter, categoryFilter, sourceTypeFilter, consignmentFilter, sortBy]);

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

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4">
        <InventoryManagerHeader onCreateListing={onCreateListing} />
        
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
        
        <InventoryContent
          listings={filteredAndSortedListings}
          viewMode={viewMode}
          loading={loading}
          error={error}
          onDeleteListing={deleteListing}
          onUpdateListing={updateListing}
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
