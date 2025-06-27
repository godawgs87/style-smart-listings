
import { useState, useEffect, useMemo } from 'react';
import { useListings } from '@/hooks/useListings';
import { useInventoryFilters } from '@/components/inventory/InventoryFilters';
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading';
import type { Listing } from '@/types/Listing';

export const useInventoryManager = () => {
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

  // Start with very small limits to prevent timeouts
  const progressiveLoading = useProgressiveLoading({
    initialLimit: 2, // Start with just 2 items
    incrementSize: 2, // Load 2 more at a time
    maxLimit: 20     // Lower max to prevent timeouts
  });

  // Data fetching with minimal initial load
  const { 
    listings, 
    loading, 
    error, 
    usingFallback,
    deleteListing, 
    duplicateListing, 
    updateListing, 
    updateListingStatus, 
    refetch,
    forceOfflineMode
  } = useListings({ 
    limit: progressiveLoading.currentLimit,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    searchTerm: searchTerm.trim() || undefined,
    categoryFilter: categoryFilter === 'all' ? undefined : categoryFilter
  });

  // Apply only client-side filters that aren't handled server-side
  const { filteredListings } = useInventoryFilters({
    listings,
    searchTerm: '', // Server-side handled
    statusFilter: 'all', // Server-side handled
    categoryFilter: 'all', // Server-side handled
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
    if (filteredListings.length === 0) {
      return {
        totalItems: 0,
        totalValue: 0,
        averageProfit: 0,
        averageDaysToSell: 0
      };
    }

    const totalItems = filteredListings.length;
    const totalValue = filteredListings.reduce((sum, listing) => sum + (listing.price || 0), 0);
    const profitableListings = filteredListings.filter(l => l.net_profit && l.net_profit > 0);
    const averageProfit = profitableListings.length > 0 
      ? profitableListings.reduce((sum, l) => sum + (l.net_profit || 0), 0) / profitableListings.length 
      : 0;
    const listingsWithDays = filteredListings.filter(l => l.days_to_sell);
    const averageDaysToSell = listingsWithDays.length > 0
      ? listingsWithDays.reduce((sum, l) => sum + (l.days_to_sell || 0), 0) / listingsWithDays.length
      : 0;

    return {
      totalItems,
      totalValue,
      averageProfit,
      averageDaysToSell
    };
  }, [filteredListings]);

  // Enable bulk mode when items are selected
  useEffect(() => {
    setIsBulkMode(selectedItems.length > 0);
  }, [selectedItems]);

  // Reset progressive loading when server-side filters change
  useEffect(() => {
    console.log('Server-side filters changed, resetting progressive loading');
    progressiveLoading.reset();
  }, [statusFilter, categoryFilter, searchTerm]);

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

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const handleLoadMore = async () => {
    console.log('Loading more items, current limit:', progressiveLoading.currentLimit);
    if (usingFallback) {
      progressiveLoading.loadMore();
      return true;
    }
    return await progressiveLoading.loadMore();
  };

  return {
    // Data
    listings,
    filteredListings,
    categories,
    stats,
    loading,
    error,
    usingFallback,
    
    // Progressive loading
    canLoadMore: progressiveLoading.canLoadMore,
    isLoadingMore: progressiveLoading.isLoadingMore,
    currentLimit: progressiveLoading.currentLimit,
    handleLoadMore,
    
    // State
    searchTerm,
    statusFilter,
    categoryFilter,
    sourceTypeFilter,
    consignmentFilter,
    priceRangeFilter,
    sortBy,
    viewMode,
    selectedItems,
    isBulkMode,
    
    // State setters
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setSourceTypeFilter,
    setConsignmentFilter,
    setPriceRangeFilter,
    setSortBy,
    setViewMode,
    
    // Handlers
    handleSelectItem,
    handleSelectAll,
    clearSelection,
    
    // Operations
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus,
    refetch,
    forceOfflineMode
  };
};
