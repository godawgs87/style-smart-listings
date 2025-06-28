
import React from 'react';
import { Button } from '@/components/ui/button';
import PageInfoDialog from '@/components/PageInfoDialog';
import InventoryStats from '@/components/inventory/InventoryStats';
import type { Listing } from '@/types/Listing';

interface CompactListingsHeaderProps {
  usingFallback: boolean;
  onRefetch: () => void;
  filteredListings: Listing[];
}

const CompactListingsHeader = ({ 
  usingFallback, 
  onRefetch, 
  filteredListings 
}: CompactListingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Manage Listings</h1>
        <PageInfoDialog pageName="Manage Listings" />
        {usingFallback && (
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
              Offline
            </div>
            <Button
              onClick={onRefetch}
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600 h-7 text-xs"
            >
              Reconnect
            </Button>
          </div>
        )}
      </div>
      <InventoryStats listings={filteredListings} />
    </div>
  );
};

export default CompactListingsHeader;
