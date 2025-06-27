
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useProgressiveQuery } from '@/hooks/inventory/useProgressiveQuery';
import { useListingDetails } from '@/hooks/inventory/useListingDetails';
import { useListingOperations } from '@/hooks/useListingOperations';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import VirtualizedInventoryTable from './VirtualizedInventoryTable';
import InventoryStats from './InventoryStats';
import InventoryControls from './InventoryControls';
import InventoryState from './InventoryState';
import type { Listing } from '@/types/Listing';

interface OptimizedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const OptimizedInventoryManager = ({ onCreateListing, onBack }: OptimizedInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchWithProgressiveDegradation } = useProgressiveQuery();
  const { fetchListingDetails } = useListingDetails();
  const { deleteListing } = useListingOperations();

  const loadData = async () => {
    setLoading(true);
    setError(null);

    console.log('🔄 Loading inventory...');
    const result = await fetchWithProgressiveDegradation({
      statusFilter: statusFilter === 'all' ? undefined : statusFilter,
      searchTerm: searchTerm.trim() || undefined,
      limit: 10
    });
    
    setListings(result.listings);
    setError(result.error);
    setLoading(false);

    if (result.error) {
      toast({
        title: "Error Loading Inventory",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleViewDetails = async (id: string) => {
    const { details, error } = await fetchListingDetails(id);
    if (error) {
      toast({
        title: "Failed to load details",
        description: error,
        variant: "destructive"
      });
    } else if (details) {
      console.log('Viewing details for:', details);
    }
  };

  const handleEdit = async (id: string) => {
    const { details, error } = await fetchListingDetails(id);
    if (error) {
      toast({
        title: "Failed to load listing",
        description: error,
        variant: "destructive"
      });
    } else if (details) {
      console.log('Editing listing:', details);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteListing(id);
      loadData();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Simple Inventory"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <InventoryStats listings={listings} />

        <InventoryControls
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          loading={loading}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onRefresh={loadData}
          onCreateListing={onCreateListing}
        />

        <InventoryState
          loading={loading}
          error={error}
          isEmpty={!loading && !error && listings.length === 0}
          onRetry={loadData}
          onCreateListing={onCreateListing}
        />

        {!loading && !error && listings.length > 0 && (
          <Card className="p-4">
            <VirtualizedInventoryTable
              listings={listings}
              hasNextPage={false}
              isNextPageLoading={false}
              loadNextPage={async () => {}}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        )}
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

export default OptimizedInventoryManager;
