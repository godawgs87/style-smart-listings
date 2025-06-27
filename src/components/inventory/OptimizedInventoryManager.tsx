
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useProgressiveQuery } from '@/hooks/inventory/useProgressiveQuery';
import { useListingDetails } from '@/hooks/inventory/useListingDetails';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import VirtualizedInventoryTable from './VirtualizedInventoryTable';
import { useToast } from '@/hooks/use-toast';
import { useListingOperations } from '@/hooks/useListingOperations';
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchWithProgressiveDegradation, resetQueryAttempts, currentQueryLevel } = useProgressiveQuery();
  const { fetchListingDetails } = useListingDetails();
  const { deleteListing } = useListingOperations();

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const options = {
      statusFilter: statusFilter === 'all' ? undefined : statusFilter,
      categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter,
      searchTerm: searchTerm.trim() || undefined,
      limit: 25
    };

    console.log('🔄 Loading inventory with progressive query...');
    const result = await fetchWithProgressiveDegradation(options);
    
    setListings(result.listings);
    setError(result.error);
    setLoading(false);

    if (result.error) {
      toast({
        title: "Connection Issues",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  // Debounced loading when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter]);

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
      loadData(); // Refresh the list
    }
  };

  const handleRefresh = () => {
    resetQueryAttempts();
    loadData();
  };

  // Calculate stats from loaded data
  const stats = {
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + item.price, 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  };

  const getConnectionStatus = () => {
    if (error) {
      return { icon: WifiOff, color: 'text-red-500', status: 'Connection Error', message: error };
    }
    if (currentQueryLevel === 0) {
      return { icon: Wifi, color: 'text-green-500', status: 'Good Connection', message: 'Full data loaded' };
    }
    if (currentQueryLevel === 1) {
      return { icon: AlertTriangle, color: 'text-yellow-500', status: 'Slow Connection', message: 'Limited data loaded' };
    }
    return { icon: WifiOff, color: 'text-orange-500', status: 'Poor Connection', message: 'Minimal data only' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Optimized Inventory"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Connection Status */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <connectionStatus.icon className={`w-4 h-4 ${connectionStatus.color}`} />
            <Badge variant="outline" className={`${
              connectionStatus.color === 'text-green-500' ? 'bg-green-50 text-green-800 border-green-200' :
              connectionStatus.color === 'text-yellow-500' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
              connectionStatus.color === 'text-orange-500' ? 'bg-orange-50 text-orange-800 border-orange-200' :
              'bg-red-50 text-red-800 border-red-200'
            }`}>
              {connectionStatus.status}
            </Badge>
            <span className="text-sm text-gray-600">{connectionStatus.message}</span>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-gray-600">Items Loaded</div>
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
              </SelectContent>
            </Select>

            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button onClick={onCreateListing}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </Card>

        {/* Inventory Table */}
        {!loading && !error && (
          <Card className="p-4">
            <VirtualizedInventoryTable
              listings={listings}
              hasNextPage={false}
              isNextPageLoading={loading}
              loadNextPage={async () => {}}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        )}

        {loading && (
          <Card className="p-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-gray-500">Loading inventory...</span>
            </div>
          </Card>
        )}

        {!loading && listings.length === 0 && !error && (
          <Card className="p-8 text-center">
            <div className="text-gray-500">No inventory items found</div>
            <Button onClick={onCreateListing} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Item
            </Button>
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
