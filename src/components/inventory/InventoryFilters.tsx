
import React from 'react';

interface InventoryFiltersProps {
  listings: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export const useInventoryFilters = ({
  listings,
  searchTerm,
  statusFilter,
  categoryFilter,
  sortBy
}: Omit<InventoryFiltersProps, 'setSearchTerm' | 'setStatusFilter' | 'setCategoryFilter' | 'setSortBy'>) => {
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

  return { filteredListings };
};
