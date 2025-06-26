import React, { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useListings } from '@/hooks/useListings';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import InventoryManagerHeader from '@/components/inventory/InventoryManagerHeader';
import InventoryContent from '@/components/inventory/InventoryContent';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryControls from '@/components/inventory/InventoryControls';
import BulkActionsBar from '@/components/BulkActionsBar';
import { useInventoryFilters } from '@/components/inventory/InventoryFilters';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { Listing } from '@/types/Listing';

interface InventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const InventoryManager = ({ onCreateListing, onBack }: InventoryManagerProps) => {
  const isMobile = useIsMobile();
  // Use smaller limit to prevent timeouts
  const { listings, loading, error, deleteListing, duplicateListing, updateListing, updateListingStatus, refetch } = useListings({ limit: 20 });
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('all');
  const [consignmentFilter, setConsignmentFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const { filteredListings } = useInventoryFilters({
    listings,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortBy,
    sourceTypeFilter,
    consignmentFilter,
    priceRangeFilter
  });

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(listings.map(l => l.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [listings]);

  const stats = useMemo(() => {
    const totalItems = listings.length;
    const totalValue = listings.reduce((sum, listing) => sum + (listing.price || 0), 0);
    const profitableListings = listings.filter(l => l.net_profit && l.net_profit > 0);
    const averageProfit = profitableListings.length > 0 
      ? profitableListings.reduce((sum, l) => sum + (l.net_profit || 0), 0) / profitableListings.length 
      : 0;
    const listingsWithDays = listings.filter(l => l.days_to_sell);
    const averageDaysToSell = listingsWithDays.length > 0
      ? listingsWithDays.reduce((sum, l) => sum + (l.days_to_sell || 0), 0) / listingsWithDays.length
      : 0;

    return {
      totalItems,
      totalValue,
      averageProfit,
      averageDaysToSell
    };
  }, [listings]);

  // Enable bulk mode when items are selected
  useEffect(() => {
    setIsBulkMode(selectedItems.length > 0);
  }, [selectedItems]);

  // Show timeout-specific help if needed
  useEffect(() => {
    if (error && error.includes('timeout')) {
      console.log('Timeout detected, suggesting solutions...');
    }
  }, [error]);

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? filteredListings.map(item => item.id) : []);
  };

  const handleDuplicateListing = async (item: Listing) => {
    console.log('InventoryManager: Duplicating listing:', item.id);
    
    toast({
      title: "Duplicating listing...",
      description: "Please wait while we create a copy of your listing."
    });
    
    try {
      const success = await duplicateListing(item);
      if (success) {
        console.log('InventoryManager: Listing duplicated successfully');
        toast({
          title: "Success!",
          description: "Listing duplicated successfully. You can now edit the copy."
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to duplicate listing. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('InventoryManager: Error duplicating listing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while duplicating the listing.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    console.log('Bulk deleting items:', selectedItems);
    for (const itemId of selectedItems) {
      await deleteListing(itemId);
    }
    setSelectedItems([]);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    console.log('Bulk updating status:', selectedItems, status);
    for (const itemId of selectedItems) {
      await updateListingStatus(itemId, status);
    }
    setSelectedItems([]);
  };

  const handleRetry = () => {
    console.log('Retrying with refresh...');
    toast({
      title: "Refreshing data...",
      description: "Loading your inventory with optimized settings."
    });
    refetch();
  };

  // Show timeout-specific error state
  if (error && error.includes('timeout')) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Inventory Manager"
          showBack
          onBack={onBack}
        />
        
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <RefreshCw className="w-12 h-12 mx-auto text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-orange-700">Database Timeout</h3>
              <p className="text-orange-600 mb-6">
                The database is taking too long to respond. This might be due to a large amount of data or server load.
              </p>
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again with Smaller Dataset
                </Button>
                <p className="text-xs text-gray-500">
                  We'll load fewer items at a time to prevent timeouts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4">
        <InventoryStats {...stats} />
        
        <InventoryControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          sourceTypeFilter={sourceTypeFilter}
          onSourceTypeFilterChange={setSourceTypeFilter}
          consignmentFilter={consignmentFilter}
          onConsignmentFilterChange={setConsignmentFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateListing={onCreateListing}
          categories={categories}
        />

        {selectedItems.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedItems.length}
            onBulkDelete={async () => {
              for (const itemId of selectedItems) {
                await deleteListing(itemId);
              }
              setSelectedItems([]);
            }}
            onBulkStatusUpdate={async (status: string) => {
              for (const itemId of selectedItems) {
                await updateListingStatus(itemId, status);
              }
              setSelectedItems([]);
            }}
          />
        )}
        
        <InventoryContent
          viewMode={viewMode}
          filteredListings={filteredListings}
          selectedItems={selectedItems}
          isBulkMode={isBulkMode}
          loading={loading}
          error={error}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          onUpdateListing={updateListing}
          onDeleteListing={deleteListing}
          onDuplicateListing={handleDuplicateListing}
          onRetry={handleRetry}
        />
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="inventory"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Inventory"
        />
      )}
    </div>
  );
};

export default InventoryManager;
