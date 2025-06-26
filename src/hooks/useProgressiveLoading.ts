
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProgressiveLoadingOptions {
  initialLimit: number;
  incrementSize: number;
  maxLimit: number;
}

export const useProgressiveLoading = (options: ProgressiveLoadingOptions) => {
  const [currentLimit, setCurrentLimit] = useState(options.initialLimit);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();

  const loadMore = useCallback(async () => {
    if (currentLimit >= options.maxLimit) {
      toast({
        title: "All items loaded",
        description: "You've reached the maximum number of items."
      });
      return false;
    }

    setIsLoadingMore(true);
    const newLimit = Math.min(currentLimit + options.incrementSize, options.maxLimit);
    
    try {
      setCurrentLimit(newLimit);
      toast({
        title: "Loading more items...",
        description: `Loading ${options.incrementSize} additional items.`
      });
      return true;
    } catch (error) {
      console.error('Error loading more items:', error);
      toast({
        title: "Failed to load more",
        description: "There was an error loading additional items.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentLimit, options, toast]);

  const reset = useCallback(() => {
    setCurrentLimit(options.initialLimit);
    setIsLoadingMore(false);
  }, [options.initialLimit]);

  const canLoadMore = currentLimit < options.maxLimit;

  return {
    currentLimit,
    isLoadingMore,
    canLoadMore,
    loadMore,
    reset
  };
};
