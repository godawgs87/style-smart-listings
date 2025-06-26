
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface InventoryCardFinancialsProps {
  price: number;
  purchasePrice?: number;
  isConsignment?: boolean;
  profit: number | null;
  profitMargin?: number;
  consignmentPercentage?: number;
  status?: string;
}

const InventoryCardFinancials = ({
  price,
  purchasePrice,
  isConsignment,
  profit,
  profitMargin,
  consignmentPercentage,
  status
}: InventoryCardFinancialsProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Sale Price</span>
        <span className="text-sm font-bold text-green-600">${price}</span>
      </div>
      
      {purchasePrice && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {isConsignment ? 'Consignment Cost' : 'Purchase Cost'}
          </span>
          <span className="text-sm text-gray-700">${purchasePrice}</span>
        </div>
      )}
      
      {profit !== null && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {status === 'sold' ? 'Profit' : 'Est. Profit'}
          </span>
          <span className={`text-sm font-medium ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${profit.toFixed(2)}
          </span>
        </div>
      )}

      {profitMargin && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Margin</span>
          <span className={`text-xs font-medium ${profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitMargin.toFixed(1)}%
          </span>
        </div>
      )}

      {isConsignment && consignmentPercentage && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Your Share</span>
          <span className="text-xs font-medium text-purple-600">
            {consignmentPercentage}%
          </span>
        </div>
      )}
    </div>
  );
};

export default InventoryCardFinancials;
