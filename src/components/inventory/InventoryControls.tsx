
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Search } from 'lucide-react';

interface InventoryControlsProps {
  searchTerm: string;
  statusFilter: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
  onCreateListing: () => void;
}

const InventoryControls = ({
  searchTerm,
  statusFilter,
  loading,
  onSearchChange,
  onStatusChange,
  onRefresh,
  onCreateListing
}: InventoryControlsProps) => {
  return (
    <Card className="p-4">
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

        <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <Button onClick={onCreateListing}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
    </Card>
  );
};

export default InventoryControls;
