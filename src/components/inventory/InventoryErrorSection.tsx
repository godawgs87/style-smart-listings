
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImprovedInventoryErrorBoundary from './ImprovedInventoryErrorBoundary';

interface InventoryErrorSectionProps {
  error: string | Error;
  onRetry: () => void;
  onClearFilters: () => void;
  onUseFallback: () => void;
  onShowDiagnostic: () => void;
  fallbackDataCount: number;
}

const InventoryErrorSection = ({
  error,
  onRetry,
  onClearFilters,
  onUseFallback,
  onShowDiagnostic,
  fallbackDataCount
}: InventoryErrorSectionProps) => {
  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="space-y-4">
        <ImprovedInventoryErrorBoundary 
          error={error} 
          onRetry={onRetry}
          onClearFilters={onClearFilters}
        />
        
        {fallbackDataCount > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm text-gray-700 mb-2">
              We found {fallbackDataCount} items using an alternative method.
            </div>
            <div className="flex gap-2">
              <Button onClick={onUseFallback} variant="outline" size="sm">
                Use Available Data
              </Button>
              <Button onClick={onShowDiagnostic} variant="outline" size="sm">
                Show Diagnostics
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InventoryErrorSection;
