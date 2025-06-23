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
import { Edit, Eye, Trash2, MoreVertical, CheckSquare } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import MobileHeader from '@/components/MobileHeader';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import ListingEditor from '@/components/ListingEditor';
import ListingPreview from '@/components/ListingPreview';
import BulkActionsBar from '@/components/BulkActionsBar';

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

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    setSelectedListings([]);
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
          onBack={handleCancelEdit}
        />
        <div className="p-4">
          <ListingEditor
            listing={editingListing}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
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
          onBack={handleClosePreview}
        />
        <div className="p-4">
          <ListingPreview
            listing={previewingListing}
            onEdit={() => {
              setPreviewingListing(null);
              setEditingListing(previewingListing);
            }}
            onExport={handleClosePreview}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <Navigation />
          </div>
        </div>
      </div>

      <MobileHeader 
        title="Manage Listings" 
        showBack 
        onBack={onBack}
      />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant={isBulkMode ? "default" : "outline"}
              size="sm"
              onClick={toggleBulkMode}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {isBulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}
            </Button>
            {isBulkMode && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedListings.length === listings.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Select All ({selectedListings.length} selected)
                </span>
              </div>
            )}
          </div>
        </div>

        {isBulkMode && selectedListings.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedListings.length}
            onBulkDelete={handleBulkDelete}
            onBulkStatusUpdate={handleBulkStatusUpdate}
          />
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {isBulkMode && (
                    <Checkbox
                      checked={selectedListings.includes(listing.id)}
                      onCheckedChange={(checked) => handleSelectListing(listing.id, checked as boolean)}
                      className="mt-1"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                    {listing.title}
                  </h3>
                </div>
                {!isBulkMode && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(listing.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handlePreview(listing.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(listing.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{listing.category}</Badge>
                  <Badge variant="outline">{listing.condition}</Badge>
                  {listing.status && (
                    <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                      {listing.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{listing.description?.substring(0, 100)}...</p>
                <p className="text-sm font-medium text-green-600">${listing.price}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListingsManager;
