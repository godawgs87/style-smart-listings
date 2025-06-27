
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

  const progressiveLoading = useProgressiveLoading({
    initialLimit: 12,
    incrementSize: 6,
    maxLimit: 50
  });

  // Simplified data fetching
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

  // Apply client-side filters
  const { filteredListings } = useInventoryFilters({
    listings,
    searchTerm: '',
    statusFilter: 'all',
    categoryFilter: 'all',
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

  useEffect(() => {
    setIsBulkMode(selectedItems.length > 0);
  }, [selectedItems]);

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
    console.log('🔽 Loading more items');
    if (usingFallback) {
      progressiveLoading.loadMore();
      return true;
    }
    return await progressiveLoading.loadMore();
  };

  return {
    listings,
    filteredListings,
    categories,
    stats,
    loading,
    error,
    usingFallback,
    
    canLoadMore: progressiveLoading.canLoadMore,
    isLoadingMore: progressiveLoading.isLoadingMore,
    currentLimit: progressiveLoading.currentLimit,
    handleLoadMore,
    
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
    
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setSourceTypeFilter,
    setConsignmentFilter,
    setPriceRangeFilter,
    setSortBy,
    setViewMode,
    
    handleSelectItem,
    handleSelectAll,
    clearSelection,
    
    deleteListing,
    duplicateListing,
    updateListing,
    updateListingStatus,
    refetch,
    forceOfflineMode
  };
};
