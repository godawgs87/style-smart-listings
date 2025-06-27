
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface InventoryErrorBoundaryProps {
  error: string;
  onRetry: () => void;
  onClearFilters?: () => void;
}

const InventoryErrorBoundary = ({ error, onRetry, onClearFilters }: InventoryErrorBoundaryProps) => {
  const isTimeoutError = error.includes('timeout') || error.includes('57014');
  
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-orange-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isTimeoutError ? 'Query Timeout' : 'Error Loading Inventory'}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {isTimeoutError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Try using filters to reduce the amount of data being loaded, 
                or search for specific items.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          {onClearFilters && (
            <Button onClick={onClearFilters} variant="secondary">
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InventoryErrorBoundary;
