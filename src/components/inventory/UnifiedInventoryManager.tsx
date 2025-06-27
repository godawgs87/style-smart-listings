
import React, { useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';
import { useListingOperations } from '@/hooks/useListingOperations';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Search } from 'lucide-react';
import ListingsTable from '@/components/ListingsTable';
import InventoryErrorBoundary from './InventoryErrorBoundary';

interface UnifiedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const UnifiedInventoryManager = ({ onCreateListing, onBack }: UnifiedInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const { listings, loading, error, stats, refetch, usingFallback } = useUnifiedInventory({
    searchTerm: searchTerm.trim() || undefined,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 25 // Reduced limit for better performance
  });

  const { deleteListing, updateListing } = useListingOperations();

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(listings.map(l => l.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [listings]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const handleSelectListing = (listingId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, listingId]
        : prev.filter(id => id !== listingId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? listings.map(l => l.id) : []);
  };

  const handleUpdateListing = async (listingId: string, updates: any) => {
    await updateListing(listingId, updates);
    refetch();
  };

  const handleDeleteListing = async (listingId: string) => {
    await deleteListing(listingId);
    setSelectedItems(prev => prev.filter(id => id !== listingId));
    refetch();
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.activeItems}</div>
            <div className="text-sm text-gray-600">Active</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.draftItems}</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </Card>
        </div>

        {/* Controls */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button onClick={onCreateListing}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </Card>

        {/* Status Messages */}
        {usingFallback && (
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="text-yellow-800">
              Using cached data due to connection issues.
              <Button onClick={refetch} variant="link" className="ml-2 p-0 h-auto">
                Try again
              </Button>
            </div>
          </Card>
        )}

        {/* Error Handling */}
        {error && (
          <InventoryErrorBoundary 
            error={error} 
            onRetry={refetch}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Table */}
        {!loading && !error && (
          <ListingsTable
            listings={listings}
            selectedListings={selectedItems}
            onSelectListing={handleSelectListing}
            onSelectAll={handleSelectAll}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
          />
        )}

        {loading && (
          <Card className="p-8 text-center">
            <div className="text-gray-500">Loading inventory...</div>
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

export default UnifiedInventoryManager;
