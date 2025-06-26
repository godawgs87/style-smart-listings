
import React, { useState } from 'react';
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
import PageInfoDialog from '@/components/PageInfoDialog';

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const { listings, loading, error, deleteListing, updateListing } = useListings({
    limit: 25
  });

  const handleSelectListing = (listingId: string, checked: boolean) => {
    setSelectedListings(prev => 
      checked 
        ? [...prev, listingId]
        : prev.filter(id => id !== listingId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedListings(checked ? listings.map(l => l.id) : []);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    await updateListing(listingId, updates);
  };

  const handleDeleteListing = async (listingId: string) => {
    await deleteListing(listingId);
    setSelectedListings(prev => prev.filter(id => id !== listingId));
  };

  const handlePreviewListing = (listing: any) => {
    console.log('Preview listing:', listing);
    // TODO: Implement preview functionality
  };

  const handleEditListing = (listing: any) => {
    console.log('Edit listing:', listing);
    // TODO: Implement edit functionality
  };

  const handleBulkDelete = async () => {
    if (selectedListings.length === 0) return;
    
    for (const id of selectedListings) {
      await deleteListing(id);
    }
    setSelectedListings([]);
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        title={
          <div className="flex items-center gap-2">
            Manage Listings
            <PageInfoDialog pageName="Manage Listings" />
          </div>
        }
        userEmail={user?.email}
        showBack
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <ListingsManagerControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedListings={selectedListings}
          onBulkDelete={handleBulkDelete}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredCount={filteredListings.length}
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
