
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid, List } from 'lucide-react';

interface InventoryControlsProps {
  isBulkMode: boolean;
  setIsBulkMode: (value: boolean) => void;
  selectedItems: string[];
  handleBulkDelete: () => void;
  handleBulkStatusUpdate: (status: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  onCreateListing: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  categories: string[];
  sourceTypeFilter: string;
  setSourceTypeFilter: (sourceType: string) => void;
  consignmentFilter: string;
  setConsignmentFilter: (consignment: string) => void;
  priceRangeFilter: string;
  setPriceRangeFilter: (priceRange: string) => void;
}

const InventoryControls = ({
  isBulkMode,
  setIsBulkMode,
  selectedItems,
  handleBulkDelete,
  handleBulkStatusUpdate,
  viewMode,
  setViewMode,
  onCreateListing,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  categories,
  sourceTypeFilter,
  setSourceTypeFilter,
  consignmentFilter,
  setConsignmentFilter,
  priceRangeFilter,
  setPriceRangeFilter
}: InventoryControlsProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant={isBulkMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => setIsBulkMode(!isBulkMode)}
          >
            Bulk Actions
          </Button>
          {isBulkMode && selectedItems.length > 0 && (
            <>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete ({selectedItems.length})
              </Button>
              <Select onValueChange={handleBulkStatusUpdate}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'grid' ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'table' ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button onClick={onCreateListing} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Input 
          placeholder="Search inventory..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category!}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Source Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="thrift_store">Thrift Store</SelectItem>
            <SelectItem value="estate_sale">Estate Sale</SelectItem>
            <SelectItem value="garage_sale">Garage Sale</SelectItem>
            <SelectItem value="consignment">Consignment</SelectItem>
            <SelectItem value="wholesale">Wholesale</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={consignmentFilter} onValueChange={setConsignmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Consignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="consignment">Consignment Only</SelectItem>
            <SelectItem value="owned">Owned Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-25">$0 - $25</SelectItem>
            <SelectItem value="25-50">$25 - $50</SelectItem>
            <SelectItem value="50-100">$50 - $100</SelectItem>
            <SelectItem value="100-250">$100 - $250</SelectItem>
            <SelectItem value="250-500">$250 - $500</SelectItem>
            <SelectItem value="500+">$500+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at_desc">Newest First</SelectItem>
            <SelectItem value="created_at_asc">Oldest First</SelectItem>
            <SelectItem value="price_desc">Price High-Low</SelectItem>
            <SelectItem value="price_asc">Price Low-High</SelectItem>
            <SelectItem value="title_asc">Title A-Z</SelectItem>
            <SelectItem value="profit_desc">Highest Profit</SelectItem>
            <SelectItem value="profit_margin_desc">Best Margin</SelectItem>
            <SelectItem value="days_to_sell_asc">Fastest Selling</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default InventoryControls;
