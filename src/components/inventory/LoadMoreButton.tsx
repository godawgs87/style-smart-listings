
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  isLoading: boolean;
  canLoadMore: boolean;
  currentCount: number;
  totalAvailable?: number;
}

const LoadMoreButton = ({ 
  onLoadMore, 
  isLoading, 
  canLoadMore, 
  currentCount,
  totalAvailable 
}: LoadMoreButtonProps) => {
  if (!canLoadMore) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">
          All {currentCount} items loaded
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <Button 
        onClick={onLoadMore} 
        disabled={isLoading}
        variant="outline"
        className="min-w-[200px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading more...
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-2" />
            Load More Items
          </>
        )}
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        Showing {currentCount} items
        {totalAvailable && ` of ${totalAvailable} total`}
      </p>
    </div>
  );
};

export default LoadMoreButton;
