
import { useState, useEffect, useMemo } from 'react';
import { useListings } from '@/hooks/useListings';
import { useInventoryFilters } from '@/components/inventory/InventoryFilters';
import type { Listing } from '@/types/Listing';

export const useInventoryManager = () => {
  const { listings, loading, error, deleteListing, duplicateListing, updateListing, updateListingStatus, refetch } = useListings({ limit: 20 });
  
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

  return {
    // Data
    listings,
    filteredListings,
    categories,
    stats,
    loading,
    error,
    
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
    refetch
  };
};
