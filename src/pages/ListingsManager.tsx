
import React, { useState } from 'react';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import ListingEditor from '@/components/ListingEditor';
import ListingPreview from '@/components/ListingPreview';
import BulkActionsBar from '@/components/BulkActionsBar';
import ListingsTable from '@/components/ListingsTable';
import ListingsManagerHeader from '@/components/ListingsManagerHeader';
import ListingsManagerControls from '@/components/ListingsManagerControls';
import ListingsCardView from '@/components/ListingsCardView';

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const { listings, loading, deleteListing, updateListingStatus } = useListings();
  const { user } = useAuth();
  const [editingListing, setEditingListing] = useState<any>(null);
  const [previewingListing, setPreviewingListing] = useState<any>(null);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      setSelectedListings(prev => [...prev, listingId]);
    } else {
      setSelectedListings(prev => prev.filter(id => id !== listingId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(listings.map(l => l.id));
    } else {
      setSelectedListings([]);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedListings.length} listings?`)) {
      for (const id of selectedListings) {
        await deleteListing(id);
      }
      setSelectedListings([]);
      setIsBulkMode(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    for (const id of selectedListings) {
      await updateListingStatus(id, status);
    }
    setSelectedListings([]);
    setIsBulkMode(false);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    await updateListingStatus(listingId, updates.status, updates);
  };

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedListings([]);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'cards' ? 'table' : 'cards');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading listings...</p>
        </div>
      </div>
    );
  }

  // Show editor if editing
  if (editingListing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ListingsManagerHeader 
          userEmail={user?.email}
          onBack={() => setEditingListing(null)}
        />
        <div className="p-4">
          <ListingEditor
            listing={editingListing}
            onSave={() => setEditingListing(null)}
            onCancel={() => setEditingListing(null)}
          />
        </div>
      </div>
    );
  }

  // Show preview if previewing
  if (previewingListing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ListingsManagerHeader 
          userEmail={user?.email}
          onBack={() => setPreviewingListing(null)}
        />
        <div className="p-4">
          <ListingPreview
            listing={previewingListing}
            onEdit={() => {
              setPreviewingListing(null);
              setEditingListing(previewingListing);
            }}
            onExport={() => setPreviewingListing(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ListingsManagerHeader 
        userEmail={user?.email}
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <ListingsManagerControls
          viewMode={viewMode}
          isBulkMode={isBulkMode}
          selectedCount={selectedListings.length}
          onToggleViewMode={toggleViewMode}
          onToggleBulkMode={toggleBulkMode}
        />

        {/* Bulk Actions Bar */}
        {(isBulkMode || viewMode === 'table') && selectedListings.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedListings.length}
            onBulkDelete={handleBulkDelete}
            onBulkStatusUpdate={handleBulkStatusUpdate}
          />
        )}

        {/* Content */}
        {viewMode === 'table' ? (
          <ListingsTable
            listings={listings}
            selectedListings={selectedListings}
            onSelectListing={handleSelectListing}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={deleteListing}
          />
        ) : (
          <ListingsCardView
            listings={listings}
            isBulkMode={isBulkMode}
            selectedListings={selectedListings}
            onSelectListing={handleSelectListing}
            onEditListing={setEditingListing}
            onPreviewListing={setPreviewingListing}
            onDeleteListing={deleteListing}
          />
        )}

        {/* Empty State */}
        {listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No listings found. Create your first listing to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsManager;
