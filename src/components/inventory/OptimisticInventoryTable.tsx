import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Copy, MoreVertical, Grid, List } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ListingsTableColumnManager from '../listings/table/ListingsTableColumnManager';
import ListingsTableEmpty from '../listings/table/ListingsTableEmpty';
import ListingImagePreview from '../ListingImagePreview';
import type { Listing } from '@/types/Listing';

interface OptimisticInventoryTableProps {
  listings: Listing[];
  selectedListings: string[];
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: Partial<Listing>) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
}

const OptimisticInventoryTable = ({
  listings,
  selectedListings,
  onSelectListing,
  onSelectAll,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing
}: OptimisticInventoryTableProps) => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, 'deleting' | 'updating'>>(new Map());
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    title: true,
    price: true,
    status: true,
    category: true,
    condition: false,
    shipping: false,
    description: false,
    purchasePrice: false,
    netProfit: false,
    profitMargin: false,
    measurements: false,
    keywords: false,
    purchaseDate: false,
    consignmentStatus: false,
    sourceType: false,
    sourceLocation: false,
    costBasis: false,
    daysToSell: false,
    performanceNotes: false,
  });

  // Filter out listings that are being deleted
  const visibleListings = useMemo(() => {
    return listings.filter(listing => !optimisticUpdates.has(listing.id) || optimisticUpdates.get(listing.id) !== 'deleting');
  }, [listings, optimisticUpdates]);

  const handleColumnToggle = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleOptimisticDelete = async (listingId: string) => {
    setOptimisticUpdates(prev => new Map(prev).set(listingId, 'deleting'));
    
    try {
      await onDeleteListing(listingId);
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(listingId);
        return next;
      });
    } catch (error) {
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(listingId);
        return next;
      });
      throw error;
    }
  };

  const handleOptimisticUpdate = async (listingId: string, updates: Partial<Listing>) => {
    setOptimisticUpdates(prev => new Map(prev).set(listingId, 'updating'));
    
    try {
      await onUpdateListing(listingId, updates);
    } finally {
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(listingId);
        return next;
      });
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'active': return 'default';
      case 'sold': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  if (visibleListings.length === 0) {
    return <ListingsTableEmpty />;
  }

  return (
    <Card className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* View Toggle and Column Manager */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'table' | 'grid')}>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="w-4 h-4 mr-2" />
            Table
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid className="w-4 h-4 mr-2" />
            Grid
          </ToggleGroupItem>
        </ToggleGroup>

        {viewMode === 'table' && (
          <ListingsTableColumnManager
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {visibleListings.map((listing) => {
              const isUpdating = optimisticUpdates.get(listing.id) === 'updating';
              const isSelected = selectedListings.includes(listing.id);
              
              return (
                <Card key={listing.id} className={`p-3 transition-all ${isUpdating ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:shadow-md`}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectListing(listing.id, !!checked)}
                      />
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                          {onPreviewListing && (
                            <DropdownMenuItem onClick={() => onPreviewListing(listing)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                          )}
                          {onEditListing && (
                            <DropdownMenuItem onClick={() => onEditListing(listing)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
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
                    </div>
                    
                    {/* Image */}
                    <div className="aspect-square">
                      <ListingImagePreview 
                        photos={listing.photos} 
                        title={listing.title}
                        listingId={listing.id}
                        className="w-full h-full"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-1">
                      <h3 className="font-medium text-xs leading-tight line-clamp-2">{listing.title}</h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-green-600 text-sm">${listing.price?.toFixed(2)}</span>
                        {listing.status && (
                          <Badge variant={getStatusBadgeVariant(listing.status)} className="text-xs px-1 py-0">
                            {listing.status}
                          </Badge>
                        )}
                      </div>
                      
                      {listing.category && (
                        <p className="text-xs text-gray-500 truncate">{listing.category}</p>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedListings.length === visibleListings.length && visibleListings.length > 0}
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
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleListings.map((listing) => {
                const isUpdating = optimisticUpdates.get(listing.id) === 'updating';
                const isSelected = selectedListings.includes(listing.id);
                
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
                          photos={listing.photos} 
                          title={listing.title}
                          listingId={listing.id}
                          className="w-12 h-12"
                        />
                      </TableCell>
                    )}
                    
                    {visibleColumns.title && (
                      <TableCell className="max-w-xs">
                        <div className="truncate font-medium">{listing.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    )}
                    
                    {visibleColumns.price && (
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          ${listing.price?.toFixed(2)}
                        </span>
                      </TableCell>
                    )}
                    
                    {visibleColumns.status && (
                      <TableCell>
                        {listing.status && (
                          <Badge variant={getStatusBadgeVariant(listing.status)}>
                            {listing.status}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    
                    {visibleColumns.category && (
                      <TableCell>
                        <span className="text-sm">{listing.category || '-'}</span>
                      </TableCell>
                    )}
                    
                    {visibleColumns.condition && (
                      <TableCell>
                        <span className="text-sm">{listing.condition || '-'}</span>
                      </TableCell>
                    )}
                    
                    {visibleColumns.shipping && (
                      <TableCell>
                        <span className="text-sm">
                          {listing.shipping_cost ? `$${listing.shipping_cost.toFixed(2)}` : '-'}
                        </span>
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {onPreviewListing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPreviewListing(listing)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {onEditListing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditListing(listing)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOptimisticDelete(listing.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default OptimisticInventoryTable;
