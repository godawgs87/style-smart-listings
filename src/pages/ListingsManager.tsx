import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Edit, Eye, Trash2, MoreVertical, CheckSquare, Table } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import MobileHeader from '@/components/MobileHeader';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import ListingEditor from '@/components/ListingEditor';
import ListingPreview from '@/components/ListingPreview';
import BulkActionsBar from '@/components/BulkActionsBar';
import ListingsTable from '@/components/ListingsTable';

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

  const handleEdit = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setEditingListing(listing);
    }
  };

  const handlePreview = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setPreviewingListing(listing);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteListing(listingId);
    }
  };

  const handleSaveEdit = (updatedListing: any) => {
    setEditingListing(null);
    // TODO: Implement save functionality to update the listing in the database
  };

  const handleCancelEdit = () => {
    setEditingListing(null);
  };

  const handleClosePreview = () => {
    setPreviewingListing(null);
  };

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
        <MobileHeader 
          title="Edit Listing" 
          showBack 
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
        <MobileHeader 
          title="Preview Listing" 
          showBack 
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
      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <Navigation />
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader 
          title="Manage Listings" 
          showBack 
          onBack={onBack}
        />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant={viewMode === 'table' ? "default" : "outline"}
              size="sm"
              onClick={toggleViewMode}
            >
              <Table className="w-4 h-4 mr-2" />
              {viewMode === 'table' ? 'Table View' : 'Card View'}
            </Button>
            
            {viewMode === 'cards' && (
              <Button
                variant={isBulkMode ? "default" : "outline"}
                size="sm"
                onClick={toggleBulkMode}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {isBulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}
              </Button>
            )}
            
            {(isBulkMode || viewMode === 'table') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedListings.length} selected
                </span>
              </div>
            )}
          </div>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="p-4 flex flex-col">
                {/* Header with checkbox and actions */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {isBulkMode && (
                      <Checkbox
                        checked={selectedListings.includes(listing.id)}
                        onCheckedChange={(checked) => handleSelectListing(listing.id, checked as boolean)}
                        className="mt-1 flex-shrink-0"
                      />
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {listing.title}
                    </h3>
                  </div>
                  {!isBulkMode && (
                    <div className="flex space-x-1 flex-shrink-0 ml-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                        const listing = listings.find(l => l.id === listing.id);
                        if (listing) setEditingListing(listing);
                      }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                        const listing = listings.find(l => l.id === listing.id);
                        if (listing) setPreviewingListing(listing);
                      }}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => {
                        if (window.confirm('Are you sure you want to delete this listing?')) {
                          deleteListing(listing.id);
                        }
                      }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-3 flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">{listing.category}</Badge>
                    <Badge variant="outline" className="text-xs">{listing.condition}</Badge>
                    {listing.status && (
                      <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {listing.status}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-700 line-clamp-3">
                    {listing.description?.substring(0, 80)}...
                  </p>

                  {/* Price */}
                  <p className="text-sm font-bold text-green-600">${listing.price}</p>
                </div>
              </Card>
            ))}
          </div>
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
