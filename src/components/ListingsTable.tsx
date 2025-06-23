
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
import { ScrollArea } from '@/components/ui/scroll-area';
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedListings.length === listings.length && listings.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead className="min-w-[250px]">Description</TableHead>
              <TableHead className="w-[100px]">Price</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[100px]">Condition</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Shipping</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => {
              const isEditing = editingRows.has(listing.id);
              const currentData = isEditing ? editData[listing.id] || listing : listing;

              return (
                <TableRow key={listing.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedListings.includes(listing.id)}
                      onCheckedChange={(checked) => onSelectListing(listing.id, checked as boolean)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={currentData.title}
                        onChange={(e) => updateEditData(listing.id, 'title', e.target.value)}
                        placeholder="Title"
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
                        className="min-h-[60px]"
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                      />
                    ) : (
                      <div className="text-sm">${listing.shipping_cost || 0}</div>
                    )}
                  </TableCell>

                  <TableCell>
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
      </ScrollArea>
    </div>
  );
};

export default ListingsTable;
