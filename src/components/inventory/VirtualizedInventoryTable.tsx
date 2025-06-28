
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import ListingsTableEmpty from '../listings/table/ListingsTableEmpty';
import OptimisticInventoryHeader from './OptimisticInventoryHeader';
import VirtualizedInventoryTableRows from './VirtualizedInventoryTableRows';
import type { Listing } from '@/types/Listing';

interface VirtualizedInventoryTableProps {
  listings: Listing[];
  selectedListings: string[];
  onSelectListing: (listingId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateListing: (listingId: string, updates: Partial<Listing>) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onPreviewListing?: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
  onDuplicateListing?: (listing: Listing) => Promise<Listing | null>;
  height?: number;
}

const VirtualizedInventoryTable = ({
  listings,
  selectedListings,
  onSelectListing,
  onSelectAll,
  onUpdateListing,
  onDeleteListing,
  onPreviewListing,
  onEditListing,
  onDuplicateListing,
  height = 600
}: VirtualizedInventoryTableProps) => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, 'deleting' | 'updating'>>(new Map());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
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

  const handleColumnToggle = useCallback((column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  }, []);

  const handleOptimisticDelete = useCallback(async (listingId: string) => {
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
  }, [onDeleteListing]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedListings.length === 0) return;
    
    // Mark all selected items as deleting
    const updates = new Map(optimisticUpdates);
    selectedListings.forEach(id => updates.set(id, 'deleting'));
    setOptimisticUpdates(updates);
    
    try {
      await Promise.all(selectedListings.map(id => onDeleteListing(id)));
      
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        selectedListings.forEach(id => next.delete(id));
        return next;
      });
    } catch (error) {
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        selectedListings.forEach(id => next.delete(id));
        return next;
      });
      throw error;
    }
    
    setShowBulkDeleteDialog(false);
  }, [selectedListings, optimisticUpdates, onDeleteListing]);

  if (visibleListings.length === 0) {
    return <ListingsTableEmpty />;
  }

  return (
    <Card className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <OptimisticInventoryHeader
        viewMode="table"
        onViewModeChange={() => {}}
        selectedCount={selectedListings.length}
        showBulkDeleteDialog={showBulkDeleteDialog}
        onShowBulkDeleteDialog={setShowBulkDeleteDialog}
        onBulkDelete={handleBulkDelete}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
      />

      <div className="overflow-hidden">
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
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        
        <VirtualizedInventoryTableRows
          listings={visibleListings}
          selectedListings={selectedListings}
          optimisticUpdates={optimisticUpdates}
          visibleColumns={visibleColumns}
          onSelectListing={onSelectListing}
          onUpdateListing={onUpdateListing}
          onDeleteListing={handleOptimisticDelete}
          onPreviewListing={onPreviewListing}
          onEditListing={onEditListing}
          onDuplicateListing={onDuplicateListing}
          height={height - 120} // Account for header height
        />
      </div>
    </Card>
  );
};

export default VirtualizedInventoryTable;
