
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ListingImagePreview from '@/components/ListingImagePreview';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  status: string | null;
  shipping_cost: number | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  } | null;
  keywords: string[] | null;
  photos: string[] | null;
  price_research: string | null;
  created_at: string;
}

interface VisibleColumns {
  image: boolean;
  title: boolean;
  price: boolean;
  status: boolean;
  category: boolean;
  condition: boolean;
  shipping: boolean;
  measurements: boolean;
  keywords: boolean;
  description: boolean;
}

interface ListingsTableRowProps {
  listing: Listing;
  index: number;
  isSelected: boolean;
  visibleColumns: VisibleColumns;
  onSelectListing: (listingId: string, checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: Partial<Listing>) => void;
  onDeleteListing: (listingId: string) => void;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
}

const ListingsTableRow = ({
  listing,
  index,
  isSelected,
  visibleColumns,
  onSelectListing,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing
}: ListingsTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Listing>>({});

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const statuses = ['draft', 'active', 'sold', 'archived'];

  const startEditing = () => {
    setEditData({ ...listing });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
  };

  const saveEditing = () => {
    onUpdateListing(listing.id, editData);
    setIsEditing(false);
    setEditData({});
  };

  const updateEditData = (field: keyof Listing, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateMeasurements = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value
      }
    }));
  };

  const updateKeywords = (keywords: string) => {
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setEditData(prev => ({
      ...prev,
      keywords: keywordArray
    }));
  };

  const handlePreview = () => {
    if (onPreviewListing) {
      onPreviewListing(listing);
    } else {
      console.log('Preview listing:', listing.id);
    }
  };

  const handleEdit = () => {
    if (onEditListing) {
      onEditListing(listing);
    } else {
      startEditing();
    }
  };

  const currentData = isEditing ? editData : listing;

  return (
    <TableRow 
      className={`
        ${isSelected ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
        hover:bg-blue-100/50 transition-colors
      `}
    >
      {/* Checkbox */}
      <TableCell className="sticky left-0 bg-inherit z-10 border-r">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectListing(listing.id, checked as boolean)}
        />
      </TableCell>
      
      {/* Image Preview */}
      {visibleColumns.image && (
        <TableCell className="sticky left-12 bg-inherit z-10 border-r p-2">
          <ListingImagePreview 
            photos={listing.photos} 
            title={listing.title}
          />
        </TableCell>
      )}

      {/* Product Details */}
      {visibleColumns.title && (
        <TableCell className="sticky left-28 bg-inherit z-10 border-r">
          {isEditing ? (
            <Input
              value={currentData.title || ''}
              onChange={(e) => updateEditData('title', e.target.value)}
              placeholder="Title"
              className="font-medium"
            />
          ) : (
            <div className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight">
              {listing.title}
            </div>
          )}
        </TableCell>
      )}

      {/* Price */}
      {visibleColumns.price && (
        <TableCell>
          {isEditing ? (
            <Input
              type="number"
              value={currentData.price || 0}
              onChange={(e) => updateEditData('price', parseFloat(e.target.value) || 0)}
              placeholder="Price"
              step="0.01"
              className="w-full"
            />
          ) : (
            <div className="font-bold text-green-600 text-lg">${listing.price}</div>
          )}
        </TableCell>
      )}

      {/* Status */}
      {visibleColumns.status && (
        <TableCell>
          {isEditing ? (
            <Select
              value={currentData.status || ''}
              onValueChange={(value) => updateEditData('status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge 
              variant={
                listing.status === 'active' ? 'default' : 
                listing.status === 'sold' ? 'secondary' : 
                listing.status === 'draft' ? 'outline' : 'secondary'
              }
              className={
                listing.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                listing.status === 'sold' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                listing.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                ''
              }
            >
              {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
            </Badge>
          )}
        </TableCell>
      )}

      {/* Category */}
      {visibleColumns.category && (
        <TableCell>
          {isEditing ? (
            <Select
              value={currentData.category || ''}
              onValueChange={(value) => updateEditData('category', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="secondary" className="text-xs">
              {listing.category || 'Uncategorized'}
            </Badge>
          )}
        </TableCell>
      )}

      {/* Condition */}
      {visibleColumns.condition && (
        <TableCell>
          {isEditing ? (
            <Select
              value={currentData.condition || ''}
              onValueChange={(value) => updateEditData('condition', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map(cond => (
                  <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="text-xs">
              {listing.condition || 'N/A'}
            </Badge>
          )}
        </TableCell>
      )}

      {/* Shipping */}
      {visibleColumns.shipping && (
        <TableCell>
          {isEditing ? (
            <Input
              type="number"
              value={currentData.shipping_cost || 9.95}
              onChange={(e) => updateEditData('shipping_cost', parseFloat(e.target.value) || 9.95)}
              placeholder="Shipping"
              step="0.01"
              className="w-full"
            />
          ) : (
            <div className="text-sm font-medium">${listing.shipping_cost || 9.95}</div>
          )}
        </TableCell>
      )}

      {/* Measurements */}
      {visibleColumns.measurements && (
        <TableCell>
          {isEditing ? (
            <div className="space-y-1">
              <Input
                placeholder="L x W x H"
                value={`${currentData.measurements?.length || ''} x ${currentData.measurements?.width || ''} x ${currentData.measurements?.height || ''}`}
                onChange={(e) => {
                  const parts = e.target.value.split('x').map(p => p.trim());
                  updateMeasurements('length', parts[0] || '');
                  updateMeasurements('width', parts[1] || '');
                  updateMeasurements('height', parts[2] || '');
                }}
                className="text-xs"
              />
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              {listing.measurements?.length && listing.measurements?.width && listing.measurements?.height
                ? `${listing.measurements.length}" x ${listing.measurements.width}" x ${listing.measurements.height}"`
                : 'Not set'
              }
            </div>
          )}
        </TableCell>
      )}

      {/* Keywords */}
      {visibleColumns.keywords && (
        <TableCell>
          {isEditing ? (
            <Textarea
              placeholder="keyword1, keyword2, keyword3"
              value={currentData.keywords?.join(', ') || ''}
              onChange={(e) => updateKeywords(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {listing.keywords?.slice(0, 2).map((keyword, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {keyword}
                </span>
              ))}
              {(listing.keywords?.length || 0) > 2 && (
                <span className="text-xs text-gray-400">+{(listing.keywords?.length || 0) - 2}</span>
              )}
            </div>
          )}
        </TableCell>
      )}

      {/* Description */}
      {visibleColumns.description && (
        <TableCell>
          {isEditing ? (
            <Textarea
              placeholder="Description..."
              value={currentData.description || ''}
              onChange={(e) => updateEditData('description', e.target.value)}
              className="text-xs min-h-[80px]"
            />
          ) : (
            <div className="text-xs text-gray-600 line-clamp-3">
              {listing.description && listing.description.length > 0 
                ? listing.description.substring(0, 100) + '...'
                : 'No description'
              }
            </div>
          )}
        </TableCell>
      )}

      {/* Actions */}
      <TableCell className="sticky right-0 bg-inherit z-10 border-l">
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-green-50 hover:bg-green-100 border-green-200"
                onClick={saveEditing}
              >
                <Save className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-gray-50 hover:bg-gray-100"
                onClick={cancelEditing}
              >
                <X className="h-4 w-4 text-gray-600" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-blue-50 hover:bg-blue-100 border-blue-200"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-gray-50 hover:bg-gray-100"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteListing(listing.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ListingsTableRow;
