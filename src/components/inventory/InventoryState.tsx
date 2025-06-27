
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface InventoryStateProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  onCreateListing?: () => void;
}

const InventoryState = ({ loading, error, isEmpty, onRetry, onCreateListing }: InventoryStateProps) => {
  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-gray-500">Loading inventory...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-red-200 bg-red-50">
        <div className="text-red-800 mb-4">{error}</div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 mb-4">No inventory items found</div>
        {onCreateListing && (
          <Button onClick={onCreateListing}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Item
          </Button>
        )}
      </Card>
    );
  }

  return null;
};

export default InventoryState;
