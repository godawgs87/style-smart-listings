
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search, X } from 'lucide-react';

interface ImprovedInventoryControlsProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  categories: string[];
  loading: boolean;
  selectedCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onCreateListing: () => void;
}

const ImprovedInventoryControls = ({
  searchTerm,
  statusFilter,
  categoryFilter,
  categories,
  loading,
  selectedCount,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onClearFilters,
  onRefresh,
  onCreateListing
}: ImprovedInventoryControlsProps) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || categoryFilter !== 'all';

  return (
    <Card className="p-4 space-y-4">
      {/* Top Row - Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button onClick={onCreateListing} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={statusFilter} onValueChange={onStatusChange}>
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

        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button onClick={onClearFilters} variant="ghost" size="sm">
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}

        {selectedCount > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {selectedCount} selected
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default ImprovedInventoryControls;
