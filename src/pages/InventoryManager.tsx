
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import InventoryCard from '@/components/InventoryCard';
import InventoryStats from '@/components/inventory/InventoryStats';
import InventoryControls from '@/components/inventory/InventoryControls';
import ListingsTable from '@/components/ListingsTable';
import { AlertCircle } from 'lucide-react';

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
  const { listings, loading, error, deleteListing, updateListing } = useListings();

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

  // Filter and sort listings
  const filteredListings = listings
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_at_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_at_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_desc':
          return b.price - a.price;
        case 'price_asc':
          return a.price - b.price;
        case 'title_asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Calculate summary stats
  const totalValue = listings.reduce((sum, item) => sum + item.price, 0);
  const totalCost = listings.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
  const totalProfit = totalValue - totalCost;
  const activeItems = listings.filter(item => item.status === 'active');
  const categories = [...new Set(listings.map(item => item.category).filter(Boolean))];

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
        <StreamlinedHeader
          title="Inventory Manager"
          userEmail={user?.email}
          showBack
          onBack={onBack}
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        userEmail={user?.email}
        showBack
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <InventoryStats
          totalItems={listings.length}
          activeItems={activeItems.length}
          totalValue={totalValue}
          totalProfit={totalProfit}
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
          categories={categories}
        />

        {error && (
          <div className="text-red-500 flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            Failed to load inventory. Please try again.
          </div>
        )}

        {/* Inventory Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                isBulkMode={isBulkMode}
                isSelected={selectedItems.includes(item.id)}
                onSelect={(checked) => handleSelectItem(item.id, checked)}
                onEdit={() => console.log('Edit', item.id)}
                onPreview={() => console.log('Preview', item.id)}
                onDelete={() => deleteListing(item.id)}
              />
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <ListingsTable
            listings={filteredListings}
            selectedListings={selectedItems}
            onSelectListing={handleSelectItem}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
          />
        )}

        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No items found matching your criteria.
          </div>
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

export default InventoryManager;
