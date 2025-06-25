
import React from 'react';

interface InventoryStatsProps {
  totalItems: number;
  activeItems: number;
  totalValue: number;
  totalProfit: number;
}

const InventoryStats = ({ totalItems, activeItems, totalValue, totalProfit }: InventoryStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm text-gray-500">Total Items</div>
        <div className="text-2xl font-bold">{totalItems}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm text-gray-500">Active Listings</div>
        <div className="text-2xl font-bold text-green-600">{activeItems}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm text-gray-500">Total Value</div>
        <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm text-gray-500">Est. Profit</div>
        <div className={`text-2xl font-bold ${totalProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${totalProfit.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
