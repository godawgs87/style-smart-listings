
import React, { useMemo } from 'react';
import ListingsManagerControls from '@/components/ListingsManagerControls';
import ListingsManagerFilters from '@/components/listings-manager/ListingsManagerFilters';
import ListingsManagerContent from '@/components/listings-manager/ListingsManagerContent';
import DataManagementSection from '@/components/listings-manager/DataManagementSection';
import type { Listing } from '@/types/Listing';

interface ListingsManagerMainProps {
  listings: Listing[];
  selectedListings: string[];
  setSelectedListings: (listings: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  conditionFilter: string;
  setConditionFilter: (filter: string) => void;
  priceRangeFilter: string;
  setPriceRangeFilter: (filter: string) => void;
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
  onRefetch: () => void;
  onUpdateListing: (listingId: string, updates: any) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
}

const ListingsManagerMain = ({
  listings,
  selectedListings,
  setSelectedListings,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  conditionFilter,
  setConditionFilter,
  priceRangeFilter,
  setPriceRangeFilter,
  loading,
  error,
  usingFallback,
  onRefetch,
  onUpdateListing,
  onDeleteListing
}: ListingsManagerMainProps) => {
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(listings.map(l => l.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = searchTerm === '' || 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase());

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
    setSelectedListings(
      checked 
        ? [...selectedListings, listingId]
        : selectedListings.filter(id => id !== listingId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedListings(checked ? filteredListings.map(l => l.id) : []);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    await onUpdateListing(listingId, updates);
    onRefetch();
  };

  const handleDeleteListing = async (listingId: string) => {
    await onDeleteListing(listingId);
    setSelectedListings(selectedListings.filter(id => id !== listingId));
    onRefetch();
  };

  const handleBulkDelete = async () => {
    if (selectedListings.length === 0) return;
    
    if (window.confirm(`Delete ${selectedListings.length} listings? This cannot be undone.`)) {
      for (const id of selectedListings) {
        await onDeleteListing(id);
      }
      setSelectedListings([]);
      onRefetch();
    }
  };

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setConditionFilter('all');
    setPriceRangeFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {usingFallback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-yellow-800 text-sm">
            Using cached data due to connection issues. 
            <button onClick={onRefetch} className="ml-2 underline">
              Try again
            </button>
          </p>
        </div>
      )}

      <DataManagementSection 
        listings={listings}
        onDataUpdate={onRefetch}
      />

      <ListingsManagerControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedListings={selectedListings}
        onBulkDelete={handleBulkDelete}
        viewMode="table"
        setViewMode={() => {}}
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
        activeFiltersCount={[categoryFilter, conditionFilter, priceRangeFilter]
          .filter(filter => filter !== 'all').length}
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
  );
};

export default ListingsManagerMain;
