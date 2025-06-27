
import React from 'react';
import { Card } from '@/components/ui/card';
import type { Listing } from '@/types/Listing';

interface InventoryStatsProps {
  listings: Listing[];
}

const InventoryStats = ({ listings }: InventoryStatsProps) => {
  const stats = {
    totalItems: listings?.length || 0,
    totalValue: listings?.reduce((sum, item) => sum + (item?.price || 0), 0) || 0,
    activeItems: listings?.filter(item => item?.status === 'active')?.length || 0,
    draftItems: listings?.filter(item => item?.status === 'draft')?.length || 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
        <div className="text-sm text-gray-600">Items Loaded</div>
      </Card>
      <Card className="p-4">
        <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</div>
        <div className="text-sm text-gray-600">Total Value</div>
      </Card>
      <Card className="p-4">
        <div className="text-2xl font-bold text-purple-600">{stats.activeItems}</div>
        <div className="text-sm text-gray-600">Active</div>
      </Card>
      <Card className="p-4">
        <div className="text-2xl font-bold text-orange-600">{stats.draftItems}</div>
        <div className="text-sm text-gray-600">Drafts</div>
      </Card>
    </div>
  );
};

export default InventoryStats;
