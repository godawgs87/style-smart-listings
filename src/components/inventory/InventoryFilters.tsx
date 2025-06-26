
import React from 'react';

interface InventoryFiltersProps {
  listings: any[];
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  sortBy: string;
  sourceTypeFilter: string;
  consignmentFilter: string;
  priceRangeFilter: string;
}

export const useInventoryFilters = ({
  listings,
  searchTerm,
  statusFilter,
  categoryFilter,
  sortBy,
  sourceTypeFilter,
  consignmentFilter,
  priceRangeFilter
}: InventoryFiltersProps) => {
  const filteredListings = listings
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      const matchesSourceType = sourceTypeFilter === 'all' || item.source_type === sourceTypeFilter;
      
      const matchesConsignment = consignmentFilter === 'all' || 
                                (consignmentFilter === 'consignment' && item.is_consignment) ||
                                (consignmentFilter === 'owned' && !item.is_consignment);
      
      const matchesPriceRange = (() => {
        if (priceRangeFilter === 'all') return true;
        const price = item.price || 0;
        switch (priceRangeFilter) {
          case '0-25': return price >= 0 && price <= 25;
          case '25-50': return price > 25 && price <= 50;
          case '50-100': return price > 50 && price <= 100;
          case '100-250': return price > 100 && price <= 250;
          case '250-500': return price > 250 && price <= 500;
          case '500+': return price > 500;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesCategory && matchesSourceType && matchesConsignment && matchesPriceRange;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_at_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_at_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'profit_desc':
          return (b.net_profit || 0) - (a.net_profit || 0);
        case 'profit_margin_desc':
          return (b.profit_margin || 0) - (a.profit_margin || 0);
        case 'days_to_sell_asc':
          return (a.days_to_sell || 999) - (b.days_to_sell || 999);
        default:
          return 0;
      }
    });

  return { filteredListings };
};

// Create a component for future use if needed
const InventoryFilters = () => {
  return null; // This is just a placeholder component
};

export default InventoryFilters;
