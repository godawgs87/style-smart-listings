
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, LayoutGrid, LayoutList } from 'lucide-react';

interface InventoryControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  sourceTypeFilter: string;
  onSourceTypeFilterChange: (value: string) => void;
  consignmentFilter: string;
  onConsignmentFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onCreateListing: () => void;
  categories: string[];
}

const InventoryControls = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sourceTypeFilter,
  onSourceTypeFilterChange,
  consignmentFilter,
  onConsignmentFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onCreateListing,
  categories
}: InventoryControlsProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceTypeFilter} onValueChange={onSourceTypeFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="estate_sale">Estate Sale</SelectItem>
            <SelectItem value="garage_sale">Garage Sale</SelectItem>
            <SelectItem value="thrift_store">Thrift Store</SelectItem>
            <SelectItem value="auction">Auction</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="wholesale">Wholesale</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={consignmentFilter} onValueChange={onConsignmentFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="owned">Owned</SelectItem>
            <SelectItem value="consignment">Consignment</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date Added</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="profit_margin">Profit %</SelectItem>
            <SelectItem value="days_to_sell">Days to Sell</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className="rounded-l-none"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onCreateListing} className="gradient-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>
    </div>
  );
};

export default InventoryControls;
