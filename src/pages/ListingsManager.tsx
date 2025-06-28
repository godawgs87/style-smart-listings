import React, { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';
import { useListingOperations } from '@/hooks/useListingOperations';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import ListingsManagerControls from '@/components/ListingsManagerControls';
import ListingsLoadingState from '@/components/ListingsLoadingState';
import ListingsManagerHeader from '@/components/listings-manager/ListingsManagerHeader';
import ListingsManagerFilters from '@/components/listings-manager/ListingsManagerFilters';
import ListingsManagerContent from '@/components/listings-manager/ListingsManagerContent';
import InventoryStats from '@/components/inventory/InventoryStats';

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const { 
    listings, 
    loading, 
    error, 
    usingFallback,
    refetch
  } = useUnifiedInventory({
    searchTerm: searchTerm.trim() || undefined,
    statusFilter: 'all',
    categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 25
  });

  const { deleteListing, updateListing } = useListingOperations();

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(listings.map(l => l.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = searchTerm === '' || 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
      const matchesCondition = conditionFilter === 'all' || 
        listing.condition?.toLowerCase() === conditionFilter;

      const matchesPriceRange = () => {
        if (priceRangeFilter === 'all') return true;
        const price = listing.price;
        switch (priceRangeFilter) {
          case 'under-25': return price < 25;
          case '25-100': return price >= 25 && price <= 100;
          case '100-500': return price > 100 && price <= 500;
          case 'over-500': return price > 500;
          default: return true;
        }
      };

      return matchesSearch && matchesCategory && matchesCondition && matchesPriceRange();
    });
  }, [listings, searchTerm, categoryFilter, conditionFilter, priceRangeFilter]);

  const handleSelectListing = (listingId: string, checked: boolean) => {
    setSelectedListings(prev => 
      checked 
        ? [...prev, listingId]
        : prev.filter(id => id !== listingId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedListings(checked ? filteredListings.map(l => l.id) : []);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    await updateListing(listingId, updates);
    refetch();
  };

  const handleDeleteListing = async (listingId: string) => {
    console.log('Deleting listing:', listingId);
    await deleteListing(listingId);
    setSelectedListings(prev => prev.filter(id => id !== listingId));
    refetch();
  };

  const handleBulkDelete = async () => {
    if (selectedListings.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedListings.length} listings? This action cannot be undone.`)) {
      for (const id of selectedListings) {
        await deleteListing(id);
      }
      setSelectedListings([]);
      refetch();
    }
  };

  const activeFiltersCount = [categoryFilter, conditionFilter, priceRangeFilter]
    .filter(filter => filter !== 'all').length;

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setConditionFilter('all');
    setPriceRangeFilter('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <ListingsLoadingState 
        title="Manage Listings"
        userEmail={user?.email}
        onBack={onBack}
        isMobile={isMobile}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Manage Listings"
        userEmail={user?.email}
        showBack
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-3">
        {/* Compact Header and Stats Row */}
        <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Manage Listings</h1>
            <PageInfoDialog pageName="Manage Listings" />
            {usingFallback && (
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                  Offline
                </div>
                <Button
                  onClick={refetch}
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600 h-7 text-xs"
                >
                  Reconnect
                </Button>
              </div>
            )}
          </div>
          <InventoryStats listings={filteredListings} />
        </div>

        <ListingsManagerControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedListings={selectedListings}
          onBulkDelete={handleBulkDelete}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredCount={filteredListings.length}
        />

        <ListingsManagerFilters
          categories={categories}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          conditionFilter={conditionFilter}
          onConditionChange={setConditionFilter}
          priceRangeFilter={priceRangeFilter}
          onPriceRangeChange={setPriceRangeFilter}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
        />

        <ListingsManagerContent
          loading={loading}
          error={error}
          filteredListings={filteredListings}
          selectedListings={selectedListings}
          onSelectListing={handleSelectListing}
          onSelectAll={handleSelectAll}
          onUpdateListing={handleUpdateListing}
          onDeleteListing={handleDeleteListing}
        />
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="listings"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Manage Listings"
        />
      )}
    </div>
  );
};

export default ListingsManager;
