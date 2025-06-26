
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import ListingsTable from '@/components/ListingsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

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
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Manage Listings"
          userEmail={user?.email}
          showBack
          onBack={onBack}
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-2">Loading listings...</span>
        </div>
      </div>
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
        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Input 
              type="text" 
              placeholder="Search listings..." 
              className="max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {selectedListings.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
              >
                Delete Selected ({selectedListings.length})
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <div className="text-sm text-gray-600">
              {filteredListings.length} listings
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 flex items-center bg-red-50 p-4 rounded-lg">
            <AlertCircle className="mr-2 h-4 w-4" />
            <div>
              <p className="font-medium">Connection timeout</p>
              <p className="text-sm">Please check your internet connection and try refreshing the page.</p>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isBulkMode={selectedListings.length > 0}
                isSelected={selectedListings.includes(listing.id)}
                onSelect={(checked) => handleSelectListing(listing.id, checked)}
                onEdit={() => handleEditListing(listing)}
                onPreview={() => handlePreviewListing(listing)}
                onDelete={() => handleDeleteListing(listing.id)}
              />
            ))}
          </div>
        )}

        {/* Table View */}
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
          <div className="text-center py-12 text-gray-500">
            No listings found. Create your first listing to get started!
          </div>
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
