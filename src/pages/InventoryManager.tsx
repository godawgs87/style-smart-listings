import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import InventoryCard from '@/components/InventoryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Grid, List, Filter } from 'lucide-react';

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
    setSelectedItems(checked ? listings.map(l => l.id) : []);
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
  const soldItems = listings.filter(item => item.status === 'sold');
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
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Items</div>
            <div className="text-2xl font-bold">{listings.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Active Listings</div>
            <div className="text-2xl font-bold text-green-600">{activeItems.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Value</div>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Est. Profit</div>
            <div className={`text-2xl font-bold ${totalProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalProfit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={isBulkMode ? "default" : "outline"} 
                size="sm" 
                onClick={() => setIsBulkMode(!isBulkMode)}
              >
                Bulk Actions
              </Button>
              {isBulkMode && selectedItems.length > 0 && (
                <>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    Delete ({selectedItems.length})
                  </Button>
                  <Select onValueChange={handleBulkStatusUpdate}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'grid' ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'table' ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button onClick={onCreateListing} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input 
              placeholder="Search inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="price_desc">Price High-Low</SelectItem>
                <SelectItem value="price_asc">Price Low-High</SelectItem>
                <SelectItem value="title_asc">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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

        {/* Table View - Keep existing ListingsTable for now */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* We can use the existing ListingsTable component here */}
            <p className="p-4 text-gray-500">Table view - use existing ListingsTable component</p>
          </div>
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
