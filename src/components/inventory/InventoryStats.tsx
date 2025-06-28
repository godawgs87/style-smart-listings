
import React from 'react';
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
    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4 text-xs">
      <div className="flex items-center gap-1 p-2 bg-blue-50 rounded">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="font-semibold text-blue-600">{stats.totalItems}</span>
        <span className="text-gray-600">Items</span>
      </div>
      <div className="flex items-center gap-1 p-2 bg-green-50 rounded">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="font-semibold text-green-600">${stats.totalValue.toFixed(0)}</span>
        <span className="text-gray-600">Value</span>
      </div>
      <div className="flex items-center gap-1 p-2 bg-purple-50 rounded">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <span className="font-semibold text-purple-600">{stats.activeItems}</span>
        <span className="text-gray-600">Active</span>
      </div>
      <div className="flex items-center gap-1 p-2 bg-orange-50 rounded">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span className="font-semibold text-orange-600">{stats.draftItems}</span>
        <span className="text-gray-600">Drafts</span>
      </div>
    </div>
  );
};

export default InventoryStats;
