
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, Trash2, Eye } from 'lucide-react';
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

interface ListingsTableProps {
  listings: Listing[];
  selectedListings: string[];
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: Partial<Listing>) => void;
  onDeleteListing: (listingId: string) => void;
}

const ListingsTable = ({
  listings,
  selectedListings,
  onSelectListing,
  onSelectAll,
  onUpdateListing,
  onDeleteListing
}: ListingsTableProps) => {
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [editData, setEditData] = useState<Record<string, Partial<Listing>>>({});

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const statuses = ['draft', 'active', 'sold', 'archived'];

  const startEditing = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setEditData(prev => ({ ...prev, [listingId]: { ...listing } }));
      setEditingRows(prev => new Set([...prev, listingId]));
    }
  };

  const cancelEditing = (listingId: string) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(listingId);
      return newSet;
    });
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[listingId];
      return newData;
    });
  };

  const saveEditing = (listingId: string) => {
    const updates = editData[listingId];
    if (updates) {
      onUpdateListing(listingId, updates);
      cancelEditing(listingId);
    }
  };

  const updateEditData = (listingId: string, field: keyof Listing, value: any) => {
    setEditData(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        [field]: value
      }
    }));
  };

  const updateMeasurement = (listingId: string, measurementField: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [listingId]: {
        ...prev[listingId],
        measurements: {
          ...((prev[listingId]?.measurements as any) || {}),
          [measurementField]: value
        }
      }
    }));
  };

  const updateKeywords = (listingId: string, value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    updateEditData(listingId, 'keywords', keywords);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-b-2">
                <TableHead className="w-12 sticky left-0 bg-gray-50 z-20 border-r">
                  <Checkbox
                    checked={selectedListings.length === listings.length && listings.length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead className="w-16 sticky left-12 bg-gray-50 z-20 border-r">Image</TableHead>
                <TableHead className="min-w-[250px] sticky left-28 bg-gray-50 z-20 border-r font-semibold">
                  Product Details
                </TableHead>
                <TableHead className="w-[120px] font-semibold">Price</TableHead>
                <TableHead className="w-[100px] font-semibold">Status</TableHead>
                <TableHead className="w-[120px] font-semibold">Category</TableHead>
                <TableHead className="w-[100px] font-semibold">Condition</TableHead>
                <TableHead className="w-[100px]">Shipping</TableHead>
                <TableHead className="w-[140px] sticky right-0 bg-gray-50 z-20 border-l font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing, index) => {
                const isEditing = editingRows.has(listing.id);
                const currentData = isEditing ? editData[listing.id] || listing : listing;
                const isSelected = selectedListings.includes(listing.id);

                return (
                  <TableRow 
                    key={listing.id} 
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
                    <TableCell className="sticky left-12 bg-inherit z-10 border-r p-2">
                      <ListingImagePreview 
                        photos={listing.photos} 
                        title={listing.title}
                      />
                    </TableCell>

                    {/* Product Details */}
                    <TableCell className="sticky left-28 bg-inherit z-10 border-r">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={currentData.title}
                            onChange={(e) => updateEditData(listing.id, 'title', e.target.value)}
                            placeholder="Title"
                            className="font-medium"
                          />
                          <Textarea
                            value={currentData.description || ''}
                            onChange={(e) => updateEditData(listing.id, 'description', e.target.value)}
                            placeholder="Description"
                            className="min-h-[60px] text-sm"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight">
                            {listing.title}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {listing.description && listing.description.length > 0 
                              ? listing.description.substring(0, 120) + '...'
                              : 'No description'
                            }
                          </div>
                          {listing.keywords && listing.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {listing.keywords.slice(0, 3).map((keyword, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  {keyword}
                                </span>
                              ))}
                              {listing.keywords.length > 3 && (
                                <span className="text-xs text-gray-400">+{listing.keywords.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={currentData.price}
                          onChange={(e) => updateEditData(listing.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="Price"
                          step="0.01"
                          className="w-full"
                        />
                      ) : (
                        <div className="font-bold text-green-600 text-lg">${listing.price}</div>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={currentData.status || ''}
                          onValueChange={(value) => updateEditData(listing.id, 'status', value)}
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

                    {/* Category */}
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={currentData.category || ''}
                          onValueChange={(value) => updateEditData(listing.id, 'category', value)}
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

                    {/* Condition */}
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={currentData.condition || ''}
                          onValueChange={(value) => updateEditData(listing.id, 'condition', value)}
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

                    {/* Shipping */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={currentData.shipping_cost || 0}
                          onChange={(e) => updateEditData(listing.id, 'shipping_cost', parseFloat(e.target.value) || 0)}
                          placeholder="Shipping"
                          step="0.01"
                          className="w-full"
                        />
                      ) : (
                        <div className="text-sm font-medium">${listing.shipping_cost || 0}</div>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="sticky right-0 bg-inherit z-10 border-l">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 bg-green-50 hover:bg-green-100 border-green-200"
                              onClick={() => saveEditing(listing.id)}
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 bg-gray-50 hover:bg-gray-100"
                              onClick={() => cancelEditing(listing.id)}
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
                              onClick={() => startEditing(listing.id)}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 bg-gray-50 hover:bg-gray-100"
                              onClick={() => console.log('Preview', listing.id)}
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this listing?')) {
                                  onDeleteListing(listing.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {listings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-medium mb-2">No listings found</div>
          <div className="text-sm">Create your first listing to get started!</div>
        </div>
      )}
    </div>
  );
};

export default ListingsTable;
