
import React, { useState, useMemo } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import ListingsTableHeader from '../listings/table/ListingsTableHeader';
import ListingsTableColumnManager from '../listings/table/ListingsTableColumnManager';
import ListingsTableEmpty from '../listings/table/ListingsTableEmpty';
import ListingsTableRow from '../listings/ListingsTableRow';
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
    // Immediately hide the item
    setOptimisticUpdates(prev => new Map(prev).set(listingId, 'deleting'));
    
    try {
      await onDeleteListing(listingId);
      // Remove from optimistic updates on success
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(listingId);
        return next;
      });
    } catch (error) {
      // Restore the item if deletion failed
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

  return (
    <Card className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <ListingsTableColumnManager
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
      />

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <ListingsTableHeader
              visibleColumns={visibleColumns}
              selectedCount={selectedListings.length}
              totalCount={visibleListings.length}
              onSelectAll={onSelectAll}
            />
            <TableBody>
              {visibleListings.map((listing, index) => {
                const isUpdating = optimisticUpdates.get(listing.id) === 'updating';
                return (
                  <div key={listing.id} className={isUpdating ? 'opacity-50 pointer-events-none' : ''}>
                    <ListingsTableRow
                      listing={listing}
                      index={index}
                      isSelected={selectedListings.includes(listing.id)}
                      visibleColumns={visibleColumns}
                      onSelectListing={onSelectListing}
                      onUpdateListing={handleOptimisticUpdate}
                      onDeleteListing={handleOptimisticDelete}
                      onPreviewListing={onPreviewListing}
                      onEditListing={onEditListing}
                      onDuplicateListing={onDuplicateListing}
                    />
                  </div>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {visibleListings.length === 0 && <ListingsTableEmpty />}
    </Card>
  );
};

export default OptimisticInventoryTable;
