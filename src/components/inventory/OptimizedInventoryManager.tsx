
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useInventoryPagination } from '@/hooks/inventory/useInventoryPagination';
import { useListingDetails } from '@/hooks/inventory/useListingDetails';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Search } from 'lucide-react';
import VirtualizedInventoryTable from './VirtualizedInventoryTable';
import { useToast } from '@/hooks/use-toast';
import { useListingOperations } from '@/hooks/useListingOperations';

interface OptimizedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const OptimizedInventoryManager = ({ onCreateListing, onBack }: OptimizedInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const {
    listings,
    loading,
    hasMore,
    loadMore,
    reset
  } = useInventoryPagination();

  const { fetchListingDetails } = useListingDetails();
  const { deleteListing } = useListingOperations();

  const paginationOptions = {
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter,
    searchTerm: searchTerm.trim() || undefined,
    pageSize: 20 // Reasonable page size
  };

  // Reset and load initial data when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      reset(paginationOptions);
    }, 300); // Debounce filter changes

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleLoadMore = async () => {
    const result = await loadMore(paginationOptions);
    if (!result.success && result.error) {
      toast({
        title: "Failed to load more",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = async (id: string) => {
    const { details, error } = await fetchListingDetails(id);
    if (error) {
      toast({
        title: "Failed to load details",
        description: error,
        variant: "destructive"
      });
    } else if (details) {
      // TODO: Open details modal/drawer
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
      // TODO: Open edit modal/form
      console.log('Editing listing:', details);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteListing(id);
      reset(paginationOptions); // Refresh the list
    }
  };

  const handleRefresh = () => {
    reset(paginationOptions);
  };

  // Calculate stats from summary data
  const stats = {
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + item.price, 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Optimized Inventory"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-gray-600">Loaded Items</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Loaded Value</div>
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
              </SelectContent>
            </Select>

            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button onClick={onCreateListing}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </Card>

        {/* Virtualized Table */}
        <Card className="p-4">
          <VirtualizedInventoryTable
            listings={listings}
            hasNextPage={hasMore}
            isNextPageLoading={loading}
            loadNextPage={handleLoadMore}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        {loading && listings.length === 0 && (
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

export default OptimizedInventoryManager;
