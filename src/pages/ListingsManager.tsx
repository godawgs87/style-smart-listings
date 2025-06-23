
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import MobileHeader from '@/components/MobileHeader';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import ListingEditor from '@/components/ListingEditor';
import ListingPreview from '@/components/ListingPreview';

interface ListingsManagerProps {
  onBack: () => void;
}

const ListingsManager = ({ onBack }: ListingsManagerProps) => {
  const { listings, loading, deleteListing } = useListings();
  const { user } = useAuth();
  const [editingListing, setEditingListing] = useState<any>(null);
  const [previewingListing, setPreviewingListing] = useState<any>(null);

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
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
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{listing.category}</Badge>
                  <Badge variant="outline">{listing.condition}</Badge>
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
