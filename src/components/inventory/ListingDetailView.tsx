
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ArrowLeft, Copy, Trash2 } from 'lucide-react';
import { useListingDetails } from '@/hooks/useListingDetails';
import { useListingOperations } from '@/hooks/useListingOperations';
import ListingEditor from '@/components/ListingEditor';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import type { Listing } from '@/types/Listing';

interface ListingDetailViewProps {
  listingId: string;
  onBack: () => void;
  onDuplicated?: () => void;
  onDeleted?: () => void;
}

const ListingDetailView = ({ listingId, onBack, onDuplicated, onDeleted }: ListingDetailViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  const { loadDetails, isLoadingDetails } = useListingDetails();
  const { deleteListing, duplicateListing, updateListing } = useListingOperations();
  
  const [listing, setListing] = useState<Listing | null>(null);

  React.useEffect(() => {
    const loadListingData = async () => {
      const details = await loadDetails(listingId);
      if (details) {
        setListing(details as Listing);
      }
    };
    loadListingData();
  }, [listingId, loadDetails]);

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveEdit = async (updatedData: any) => {
    if (listing) {
      const success = await updateListing(listing.id, updatedData);
      if (success) {
        setListing({ ...listing, ...updatedData });
        setIsEditing(false);
      }
    }
  };

  const handleDelete = async () => {
    if (listing) {
      const success = await deleteListing(listing.id);
      if (success) {
        onDeleted?.();
        onBack();
      }
    }
    setShowDeleteDialog(false);
  };

  const handleDuplicate = async () => {
    if (listing && !isDuplicating) {
      setIsDuplicating(true);
      try {
        const duplicated = await duplicateListing(listing);
        if (duplicated) {
          onDuplicated?.();
        }
      } finally {
        setIsDuplicating(false);
        setShowDuplicateDialog(false);
      }
    }
  };

  if (isLoadingDetails(listingId) || !listing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ListingEditor
          listing={{
            title: listing.title,
            description: listing.description || '',
            price: listing.price,
            category: listing.category || '',
            condition: listing.condition || '',
            measurements: listing.measurements || {},
            keywords: listing.keywords || [],
            photos: listing.photos || [],
            priceResearch: listing.price_research || '',
            clothing_size: listing.clothing_size || '',
            shoe_size: listing.shoe_size || '',
            gender: listing.gender || '',
            age_group: listing.age_group || ''
          }}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDuplicateDialog(true)}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Photos</h3>
            {listing.photos && listing.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {listing.photos.slice(0, 6).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${listing.title} ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            ) : (
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">No photos</p>
              </div>
            )}
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Info */}
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Price</span>
                <p className="text-2xl font-bold text-green-600">${listing.price}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Shipping</span>
                <p className="text-lg font-semibold">${(listing.shipping_cost || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{listing.status}</Badge>
              {listing.category && <Badge variant="outline">{listing.category}</Badge>}
              {listing.condition && <Badge variant="outline">{listing.condition}</Badge>}
              {listing.is_consignment && <Badge className="bg-purple-100 text-purple-800">Consignment</Badge>}
            </div>

            {listing.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>
            )}
          </Card>

          {/* Size Information */}
          {(listing.clothing_size || listing.shoe_size || listing.gender || listing.age_group) && (
            <Card className="p-6">
              <h3 className="font-medium mb-3">Size Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.gender && (
                  <div><span className="font-medium">Gender:</span> {listing.gender}</div>
                )}
                {listing.age_group && (
                  <div><span className="font-medium">Age Group:</span> {listing.age_group}</div>
                )}
                {listing.clothing_size && (
                  <div><span className="font-medium">Clothing Size:</span> {listing.clothing_size}</div>
                )}
                {listing.shoe_size && (
                  <div><span className="font-medium">Shoe Size:</span> {listing.shoe_size}</div>
                )}
              </div>
            </Card>
          )}

          {/* Measurements */}
          {listing.measurements && Object.values(listing.measurements).some(v => v) && (
            <Card className="p-6">
              <h3 className="font-medium mb-3">Measurements</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.measurements.length && (
                  <div><span className="font-medium">Length:</span> {listing.measurements.length}</div>
                )}
                {listing.measurements.width && (
                  <div><span className="font-medium">Width:</span> {listing.measurements.width}</div>
                )}
                {listing.measurements.height && (
                  <div><span className="font-medium">Height:</span> {listing.measurements.height}</div>
                )}
                {listing.measurements.weight && (
                  <div><span className="font-medium">Weight:</span> {listing.measurements.weight}</div>
                )}
              </div>
            </Card>
          )}

          {/* Keywords */}
          {listing.keywords && listing.keywords.length > 0 && (
            <Card className="p-6">
              <h3 className="font-medium mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {listing.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{keyword}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Cross-listing Data */}
          {(listing.purchase_price || listing.source_type || listing.source_location || listing.consignor_name) && (
            <Card className="p-6">
              <h3 className="font-medium mb-3">Source & Purchase Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.purchase_price && (
                  <div>
                    <span className="text-gray-500">Purchase Price</span>
                    <p className="font-medium">${listing.purchase_price}</p>
                  </div>
                )}
                {listing.purchase_date && (
                  <div>
                    <span className="text-gray-500">Purchase Date</span>
                    <p className="font-medium">{listing.purchase_date}</p>
                  </div>
                )}
                {listing.source_type && (
                  <div>
                    <span className="text-gray-500">Source Type</span>
                    <p className="font-medium">{listing.source_type}</p>
                  </div>
                )}
                {listing.source_location && (
                  <div>
                    <span className="text-gray-500">Source Location</span>
                    <p className="font-medium">{listing.source_location}</p>
                  </div>
                )}
                {listing.consignor_name && (
                  <div>
                    <span className="text-gray-500">Consignor</span>
                    <p className="font-medium">{listing.consignor_name}</p>
                  </div>
                )}
                {listing.consignor_contact && (
                  <div>
                    <span className="text-gray-500">Consignor Contact</span>
                    <p className="font-medium">{listing.consignor_contact}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Financial Info */}
          {(listing.net_profit || listing.profit_margin || listing.cost_basis) && (
            <Card className="p-6">
              <h3 className="font-medium mb-3">Financial Details</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {listing.cost_basis && (
                  <div>
                    <span className="text-gray-500">Cost Basis</span>
                    <p className="font-medium">${listing.cost_basis}</p>
                  </div>
                )}
                {listing.net_profit && (
                  <div>
                    <span className="text-gray-500">Net Profit</span>
                    <p className="font-medium text-green-600">${listing.net_profit}</p>
                  </div>
                )}
                {listing.profit_margin && (
                  <div>
                    <span className="text-gray-500">Profit Margin</span>
                    <p className="font-medium">{listing.profit_margin}%</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Performance Data */}
          {(listing.listed_date || listing.sold_date || listing.days_to_sell || listing.performance_notes) && (
            <Card className="p-6">
              <h3 className="font-medium mb-3">Performance Data</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.listed_date && (
                  <div>
                    <span className="text-gray-500">Listed Date</span>
                    <p className="font-medium">{listing.listed_date}</p>
                  </div>
                )}
                {listing.sold_date && (
                  <div>
                    <span className="text-gray-500">Sold Date</span>
                    <p className="font-medium">{listing.sold_date}</p>
                  </div>
                )}
                {listing.sold_price && (
                  <div>
                    <span className="text-gray-500">Sold Price</span>
                    <p className="font-medium text-green-600">${listing.sold_price}</p>
                  </div>
                )}
                {listing.days_to_sell && (
                  <div>
                    <span className="text-gray-500">Days to Sell</span>
                    <p className="font-medium">{listing.days_to_sell} days</p>
                  </div>
                )}
              </div>
              {listing.performance_notes && (
                <div className="mt-3">
                  <span className="text-gray-500 text-sm">Performance Notes</span>
                  <p className="text-sm mt-1">{listing.performance_notes}</p>
                </div>
              )}
            </Card>
          )}

          {/* Research Notes */}
          {listing.price_research && (
            <Card className="p-6">
              <h3 className="font-medium mb-3">Price Research</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{listing.price_research}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Listing"
        description={`Are you sure you want to delete "${listing.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        title="Duplicate Listing"
        description={`Create a copy of "${listing.title}"? This will create a new draft listing.`}
        confirmText={isDuplicating ? "Duplicating..." : "Duplicate"}
        onConfirm={handleDuplicate}
      />
    </div>
  );
};

export default ListingDetailView;
