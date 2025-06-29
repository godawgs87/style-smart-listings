
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';
import { useListingOperations } from '@/hooks/useListingOperations';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import ListingsLoadingState from '@/components/ListingsLoadingState';
import ListingsManagerMain from '@/components/listings-manager/ListingsManagerMain';

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    limit: 50
  });

  const { deleteListing, updateListing } = useListingOperations();

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

      <ListingsManagerMain
        listings={listings}
        selectedListings={selectedListings}
        setSelectedListings={setSelectedListings}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        conditionFilter={conditionFilter}
        setConditionFilter={setConditionFilter}
        priceRangeFilter={priceRangeFilter}
        setPriceRangeFilter={setPriceRangeFilter}
        loading={loading}
        error={error}
        usingFallback={usingFallback}
        onRefetch={refetch}
        onUpdateListing={updateListing}
        onDeleteListing={deleteListing}
      />

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
