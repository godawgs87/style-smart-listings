
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import ListingsTableEmpty from '../listings/table/ListingsTableEmpty';
import OptimisticInventoryHeader from './OptimisticInventoryHeader';
import OptimisticInventoryGrid from './OptimisticInventoryGrid';
import OptimisticInventoryTableView from './OptimisticInventoryTableView';
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

  const handleBulkDelete = async () => {
    if (selectedListings.length === 0) return;
    
    // Mark all selected items as deleting
    const updates = new Map(optimisticUpdates);
    selectedListings.forEach(id => updates.set(id, 'deleting'));
    setOptimisticUpdates(updates);
    
    try {
      // Delete all selected listings
      await Promise.all(selectedListings.map(id => onDeleteListing(id)));
      
      // Clear optimistic updates for successfully deleted items
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        selectedListings.forEach(id => next.delete(id));
        return next;
      });
    } catch (error) {
      // Revert optimistic updates on error
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        selectedListings.forEach(id => next.delete(id));
        return next;
      });
      throw error;
    }
    
    setShowBulkDeleteDialog(false);
  };

  if (visibleListings.length === 0) {
    return <ListingsTableEmpty />;
  }

  return (
    <Card className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <OptimisticInventoryHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedListings.length}
        showBulkDeleteDialog={showBulkDeleteDialog}
        onShowBulkDeleteDialog={setShowBulkDeleteDialog}
        onBulkDelete={handleBulkDelete}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
      />

      {viewMode === 'grid' ? (
        <OptimisticInventoryGrid
          listings={visibleListings}
          selectedListings={selectedListings}
          optimisticUpdates={optimisticUpdates}
          onSelectListing={onSelectListing}
          onDeleteListing={handleOptimisticDelete}
          onPreviewListing={onPreviewListing}
          onEditListing={onEditListing}
          onDuplicateListing={onDuplicateListing}
        />
      ) : (
        <OptimisticInventoryTableView
          listings={visibleListings}
          selectedListings={selectedListings}
          optimisticUpdates={optimisticUpdates}
          visibleColumns={visibleColumns}
          onSelectListing={onSelectListing}
          onSelectAll={onSelectAll}
          onDeleteListing={handleOptimisticDelete}
          onUpdateListing={onUpdateListing}
          onPreviewListing={onPreviewListing}
          onEditListing={onEditListing}
          onDuplicateListing={onDuplicateListing}
        />
      )}
    </Card>
  );
};

export default OptimisticInventoryTable;
