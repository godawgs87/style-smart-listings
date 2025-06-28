import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Copy, MoreVertical, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ListingImagePreview from '../ListingImagePreview';
import { useListingDetails } from '@/hooks/useListingDetails';
import type { Listing } from '@/types/Listing';

interface OptimisticInventoryTableViewProps {
  listings: Listing[];
  selectedListings: string[];
  optimisticUpdates: Map<string, 'deleting' | 'updating'>;
  visibleColumns: any;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteListing: (listingId: string) => Promise<void>;
  onUpdateListing?: (listingId: string, updates: Partial<Listing>) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
}

const OptimisticInventoryTableView = ({
  listings,
  selectedListings,
  optimisticUpdates,
  visibleColumns,
  onSelectListing,
  onSelectAll,
  onDeleteListing,
  onUpdateListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing
}: OptimisticInventoryTableViewProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Listing>>({});
  const [detailedListings, setDetailedListings] = useState<Map<string, Listing>>(new Map());
  const { loadDetails, isLoadingDetails } = useListingDetails();

  // Load detailed data for all listings to get photos
  useEffect(() => {
    const loadAllDetails = async () => {
      const updatedDetails = new Map(detailedListings);
      
      for (const listing of listings) {
        if (!detailedListings.has(listing.id) && !isLoadingDetails(listing.id)) {
          console.log('🔍 Loading details for listing:', listing.id);
          const details = await loadDetails(listing.id);
          if (details) {
            const mergedListing = { ...listing, ...details };
            console.log('📸 Merged listing photos:', mergedListing.photos);
            updatedDetails.set(listing.id, mergedListing);
          }
        }
      }
      
      if (updatedDetails.size !== detailedListings.size) {
        setDetailedListings(updatedDetails);
      }
    };

    loadAllDetails();
  }, [listings, loadDetails, isLoadingDetails, detailedListings]);

  const getListingWithDetails = (listing: Listing): Listing => {
    const detailed = detailedListings.get(listing.id);
    return detailed || listing;
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'active': return 'default';
      case 'sold': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const handleOptimisticDelete = async (listingId: string) => {
    try {
      await onDeleteListing(listingId);
    } catch (error) {
      throw error;
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setEditData({
      title: listing.title,
      price: listing.price,
      status: listing.status,
      category: listing.category,
      condition: listing.condition,
      shipping_cost: listing.shipping_cost
    });
  };

  const handleSave = async (listingId: string) => {
    if (onUpdateListing) {
      try {
        await onUpdateListing(listingId, editData);
        setEditingId(null);
        setEditData({});
      } catch (error) {
        console.error('Failed to update listing:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const updateEditData = (field: keyof Listing, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedListings.length === listings.length && listings.length > 0}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            {visibleColumns.image && <TableHead className="w-20">Image</TableHead>}
            {visibleColumns.title && <TableHead>Title</TableHead>}
            {visibleColumns.price && <TableHead className="w-24">Price</TableHead>}
            {visibleColumns.status && <TableHead className="w-20">Status</TableHead>}
            {visibleColumns.category && <TableHead className="w-32">Category</TableHead>}
            {visibleColumns.condition && <TableHead className="w-24">Condition</TableHead>}
            {visibleColumns.shipping && <TableHead className="w-24">Shipping</TableHead>}
            <TableHead className="w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => {
            const detailedListing = getListingWithDetails(listing);
            const isUpdating = optimisticUpdates.get(listing.id) === 'updating';
            const isSelected = selectedListings.includes(listing.id);
            const isEditing = editingId === listing.id;
            
            console.log('🎯 Rendering listing:', listing.id, 'with photos:', detailedListing.photos);
            
            return (
              <TableRow 
                key={listing.id} 
                className={`${isUpdating ? 'opacity-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectListing(listing.id, !!checked)}
                  />
                </TableCell>
                
                {visibleColumns.image && (
                  <TableCell>
                    <ListingImagePreview 
                      photos={detailedListing.photos} 
                      title={detailedListing.title}
                      listingId={detailedListing.id}
                      className="w-12 h-12"
                    />
                  </TableCell>
                )}
                
                {visibleColumns.title && (
                  <TableCell className="max-w-xs">
                    {isEditing ? (
                      <Input
                        value={editData.title || ''}
                        onChange={(e) => updateEditData('title', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <>
                        <div className="truncate font-medium">{listing.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </TableCell>
                )}
                
                {visibleColumns.price && (
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.price || 0}
                        onChange={(e) => updateEditData('price', parseFloat(e.target.value) || 0)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-semibold text-green-600">
                        ${listing.price?.toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                )}
                
                {visibleColumns.status && (
                  <TableCell>
                    {isEditing ? (
                      <Select value={editData.status || 'draft'} onValueChange={(value) => updateEditData('status', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      listing.status && (
                        <Badge variant={getStatusBadgeVariant(listing.status)}>
                          {listing.status}
                        </Badge>
                      )
                    )}
                  </TableCell>
                )}
                
                {visibleColumns.category && (
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editData.category || ''}
                        onChange={(e) => updateEditData('category', e.target.value)}
                        placeholder="Category"
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm">{listing.category || '-'}</span>
                    )}
                  </TableCell>
                )}
                
                {visibleColumns.condition && (
                  <TableCell>
                    {isEditing ? (
                      <Select value={editData.condition || ''} onValueChange={(value) => updateEditData('condition', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Used">Used</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                          <SelectItem value="For Parts">For Parts</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{listing.condition || '-'}</span>
                    )}
                  </TableCell>
                )}
                
                {visibleColumns.shipping && (
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editData.shipping_cost || 0}
                        onChange={(e) => updateEditData('shipping_cost', parseFloat(e.target.value) || 0)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm">
                        {listing.shipping_cost ? `$${listing.shipping_cost.toFixed(2)}` : '-'}
                      </span>
                    )}
                  </TableCell>
                )}
                
                <TableCell>
                  {isEditing ? (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        onClick={() => handleSave(listing.id)}
                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                        {onPreviewListing && (
                          <DropdownMenuItem onClick={() => onPreviewListing(listing)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEdit(listing)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {onDuplicateListing && (
                          <DropdownMenuItem onClick={() => onDuplicateListing(listing)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleOptimisticDelete(listing.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OptimisticInventoryTableView;
