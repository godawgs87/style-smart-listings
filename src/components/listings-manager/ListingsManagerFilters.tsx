
import React from 'react';
import QuickFilters from '@/components/listings/QuickFilters';

interface ListingsManagerFiltersProps {
  categories: string[];
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  conditionFilter: string;
  onConditionChange: (condition: string) => void;
  priceRangeFilter: string;
  onPriceRangeChange: (range: string) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

const ListingsManagerFilters = ({
  categories,
  categoryFilter,
  onCategoryChange,
  conditionFilter,
  onConditionChange,
  priceRangeFilter,
  onPriceRangeChange,
  activeFiltersCount,
  onClearFilters
}: ListingsManagerFiltersProps) => {
  return (
    <QuickFilters
      categories={categories}
      selectedCategory={categoryFilter}
      onCategoryChange={onCategoryChange}
      conditionFilter={conditionFilter}
      onConditionChange={onConditionChange}
      priceRange={priceRangeFilter}
      onPriceRangeChange={onPriceRangeChange}
      activeFiltersCount={activeFiltersCount}
      onClearFilters={onClearFilters}
    />
  );
};

export default ListingsManagerFilters;
