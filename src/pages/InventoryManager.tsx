
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import InventoryManagerHeader from '@/components/inventory/InventoryManagerHeader';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryControls from '@/components/inventory/InventoryControls';
import InventoryContent from '@/components/inventory/InventoryContent';
import { useInventoryFilters } from '@/components/inventory/InventoryFilters';

interface InventoryManagerProps {
  onBack: () => void;
  onCreateListing: () => void;
}

const InventoryManager = ({ onBack, onCreateListing }: InventoryManagerProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const { listings, loading, error, deleteListing, updateListing } = useListings({
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    limit: 25
  });

  const { filteredListings } = useInventoryFilters({
    listings,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortBy
  });

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? filteredListings.map(l => l.id) : []);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    for (const id of selectedItems) {
      await deleteListing(id);
    }
    setSelectedItems([]);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedItems.length === 0) return;
    
    for (const id of selectedItems) {
      await updateListing(id, { status });
    }
    setSelectedItems([]);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    await updateListing(listingId, updates);
  };

  const handleDeleteListing = async (listingId: string) => {
    await deleteListing(listingId);
    setSelectedItems(prev => prev.filter(id => id !== listingId));
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <InventoryManagerHeader userEmail={user?.email} onBack={onBack} />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <InventoryStats
          totalItems={listings.length}
          activeItems={listings.filter(item => item.status === 'active').length}
          totalValue={listings.reduce((sum, item) => sum + item.price, 0)}
          totalProfit={listings.reduce((sum, item) => sum + item.price - (item.purchase_price || 0), 0)}
        />

        <InventoryControls
          isBulkMode={isBulkMode}
          setIsBulkMode={setIsBulkMode}
          selectedItems={selectedItems}
          handleBulkDelete={handleBulkDelete}
          handleBulkStatusUpdate={handleBulkStatusUpdate}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCreateListing={onCreateListing}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={[...new Set(listings.map(item => item.category).filter(Boolean))]}
        />

        <InventoryContent
          viewMode={viewMode}
          filteredListings={filteredListings}
          selectedItems={selectedItems}
          isBulkMode={isBulkMode}
          loading={loading}
          error={error}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          onUpdateListing={handleUpdateListing}
          onDeleteListing={handleDeleteListing}
        />
      </div>
    </div>
  );
};

export default InventoryManager;
