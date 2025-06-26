
import React, { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import ListingsTable from '@/components/ListingsTable';
import ListingsCardView from '@/components/ListingsCardView';
import ListingsManagerControls from '@/components/ListingsManagerControls';
import ListingsLoadingState from '@/components/ListingsLoadingState';
import ListingsErrorState from '@/components/ListingsErrorState';
import ListingsEmptyState from '@/components/ListingsEmptyState';
import QuickFilters from '@/components/listings/QuickFilters';
import PageInfoDialog from '@/components/PageInfoDialog';

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const { listings, loading, error, deleteListing, updateListing } = useListings({
    limit: 25
  });

  // Get unique categories for filters
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(listings.map(l => l.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [listings]);

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
  };

  const handleDeleteListing = async (listingId: string) => {
    console.log('Deleting listing:', listingId);
    await deleteListing(listingId);
    setSelectedListings(prev => prev.filter(id => id !== listingId));
  };

  const handlePreviewListing = (listing: any) => {
    console.log('Preview listing:', listing);
    // TODO: Implement preview functionality - could open a modal or navigate to preview page
  };

  const handleEditListing = (listing: any) => {
    console.log('Edit listing:', listing);
    // TODO: Implement edit functionality - could navigate to edit page or open edit modal
  };

  const handleBulkDelete = async () => {
    if (selectedListings.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedListings.length} listings? This action cannot be undone.`)) {
      for (const id of selectedListings) {
        await deleteListing(id);
      }
      setSelectedListings([]);
    }
  };

  // Apply filters
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;

      // Condition filter
      const matchesCondition = conditionFilter === 'all' || 
        listing.condition?.toLowerCase() === conditionFilter;

      // Price range filter
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

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Manage Listings</h1>
          <PageInfoDialog pageName="Manage Listings" />
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

        <QuickFilters
          categories={categories}
          selectedCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
          conditionFilter={conditionFilter}
          onConditionChange={setConditionFilter}
          priceRange={priceRangeFilter}
          onPriceRangeChange={setPriceRangeFilter}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
        />

        {error && <ListingsErrorState error={error} />}

        {viewMode === 'grid' && (
          <ListingsCardView
            listings={filteredListings}
            isBulkMode={selectedListings.length > 0}
            selectedListings={selectedListings}
            onSelectListing={handleSelectListing}
            onEditListing={handleEditListing}
            onPreviewListing={handlePreviewListing}
            onDeleteListing={handleDeleteListing}
          />
        )}

        {viewMode === 'table' && (
          <ListingsTable
            listings={filteredListings}
            selectedListings={selectedListings}
            onSelectListing={handleSelectListing}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
            onPreviewListing={handlePreviewListing}
            onEditListing={handleEditListing}
          />
        )}

        {filteredListings.length === 0 && !loading && !error && (
          <ListingsEmptyState />
        )}
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
