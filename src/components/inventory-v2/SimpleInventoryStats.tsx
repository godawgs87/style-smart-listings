
import React from 'react';
import { Card } from '@/components/ui/card';

interface SimpleInventoryStatsProps {
  stats: {
    totalItems: number;
    totalValue: number;
    activeItems: number;
    draftItems: number;
  };
}

const SimpleInventoryStats = ({ stats }: SimpleInventoryStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.activeItems}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.draftItems}</div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
      </Card>
    </div>
  );
};

export default SimpleInventoryStats;
