
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
import { Edit, Save, X, Trash2 } from 'lucide-react';

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
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Fixed table header with horizontal scroll */}
      <div className="overflow-x-auto">
        <div className="min-w-[1400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white border-b">
              <TableRow>
                <TableHead className="w-12 sticky left-0 bg-white z-10 border-r">
                  <Checkbox
                    checked={selectedListings.length === listings.length && listings.length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[200px] sticky left-12 bg-white z-10 border-r">Title</TableHead>
                <TableHead className="min-w-[250px]">Description</TableHead>
                <TableHead className="w-[100px]">Price</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[100px]">Condition</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Shipping</TableHead>
                <TableHead className="min-w-[200px]">Measurements</TableHead>
                <TableHead className="min-w-[200px]">Keywords</TableHead>
                <TableHead className="min-w-[150px]">Price Research</TableHead>
                <TableHead className="w-[120px] sticky right-0 bg-white z-10 border-l">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => {
                const isEditing = editingRows.has(listing.id);
                const currentData = isEditing ? editData[listing.id] || listing : listing;

                return (
                  <TableRow key={listing.id}>
                    <TableCell className="sticky left-0 bg-white z-10 border-r">
                      <Checkbox
                        checked={selectedListings.includes(listing.id)}
                        onCheckedChange={(checked) => onSelectListing(listing.id, checked as boolean)}
                      />
                    </TableCell>
                    
                    <TableCell className="sticky left-12 bg-white z-10 border-r">
                      {isEditing ? (
                        <Input
                          value={currentData.title}
                          onChange={(e) => updateEditData(listing.id, 'title', e.target.value)}
                          placeholder="Title"
                          className="w-full"
                        />
                      ) : (
                        <div className="font-medium">{listing.title}</div>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Textarea
                          value={currentData.description || ''}
                          onChange={(e) => updateEditData(listing.id, 'description', e.target.value)}
                          placeholder="Description"
                          className="min-h-[60px] w-full"
                        />
                      ) : (
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {listing.description?.substring(0, 100)}...
                        </div>
                      )}
                    </TableCell>

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
                        <div className="font-medium text-green-600">${listing.price}</div>
                      )}
                    </TableCell>

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
                        <Badge variant="secondary">{listing.category}</Badge>
                      )}
                    </TableCell>

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
                        <Badge variant="outline">{listing.condition}</Badge>
                      )}
                    </TableCell>

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
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                          {listing.status}
                        </Badge>
                      )}
                    </TableCell>

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
                        <div className="text-sm">${listing.shipping_cost || 0}</div>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            placeholder="Length"
                            value={(currentData.measurements as any)?.length || ''}
                            onChange={(e) => updateMeasurement(listing.id, 'length', e.target.value)}
                            className="text-xs"
                          />
                          <Input
                            placeholder="Width"
                            value={(currentData.measurements as any)?.width || ''}
                            onChange={(e) => updateMeasurement(listing.id, 'width', e.target.value)}
                            className="text-xs"
                          />
                          <Input
                            placeholder="Height"
                            value={(currentData.measurements as any)?.height || ''}
                            onChange={(e) => updateMeasurement(listing.id, 'height', e.target.value)}
                            className="text-xs"
                          />
                          <Input
                            placeholder="Weight"
                            value={(currentData.measurements as any)?.weight || ''}
                            onChange={(e) => updateMeasurement(listing.id, 'weight', e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      ) : (
                        <div className="text-xs space-y-1">
                          {listing.measurements?.length && <div>L: {listing.measurements.length}</div>}
                          {listing.measurements?.width && <div>W: {listing.measurements.width}</div>}
                          {listing.measurements?.height && <div>H: {listing.measurements.height}</div>}
                          {listing.measurements?.weight && <div>Wt: {listing.measurements.weight}</div>}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Textarea
                          placeholder="keyword1, keyword2, keyword3"
                          value={currentData.keywords?.join(', ') || ''}
                          onChange={(e) => updateKeywords(listing.id, e.target.value)}
                          className="min-h-[40px] w-full"
                        />
                      ) : (
                        <div className="text-xs">
                          {listing.keywords?.slice(0, 3).join(', ')}
                          {listing.keywords && listing.keywords.length > 3 && '...'}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Textarea
                          placeholder="Price research notes"
                          value={currentData.price_research || ''}
                          onChange={(e) => updateEditData(listing.id, 'price_research', e.target.value)}
                          className="min-h-[40px] w-full"
                        />
                      ) : (
                        <div className="text-xs text-gray-600">
                          {listing.price_research?.substring(0, 50)}...
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="sticky right-0 bg-white z-10 border-l">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => saveEditing(listing.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => cancelEditing(listing.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => startEditing(listing.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => onDeleteListing(listing.id)}
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
    </div>
  );
};

export default ListingsTable;
