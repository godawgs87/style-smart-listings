
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProgressiveLoadingOptions {
  initialLimit: number;
  incrementSize: number;
  maxLimit: number;
}

export const useProgressiveLoading = (options: ProgressiveLoadingOptions) => {
  // Start with a more reasonable initial limit
  const [currentLimit, setCurrentLimit] = useState(Math.max(options.initialLimit, 12));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastLoadTimeRef = useRef<number>(0);
  const { toast } = useToast();

  const loadMore = useCallback(async () => {
    const now = Date.now();
    
    // Reduced debounce time to be more responsive
    if (now - lastLoadTimeRef.current < 1000) {
      console.log('⏸️ Debouncing load more requests');
      return false;
    }
    
    if (currentLimit >= options.maxLimit) {
      toast({
        title: "Maximum items loaded",
        description: "Use filters to find specific items or try the database connection again.",
        variant: "default"
      });
      return false;
    }

    setIsLoadingMore(true);
    lastLoadTimeRef.current = now;
    const newLimit = Math.min(currentLimit + options.incrementSize, options.maxLimit);
    
    try {
      console.log(`🔽 Loading more: ${currentLimit} -> ${newLimit}`);
      setCurrentLimit(newLimit);
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
    const newInitialLimit = Math.max(options.initialLimit, 12);
    console.log('🔄 Resetting progressive loading to initial limit:', newInitialLimit);
    setCurrentLimit(newInitialLimit);
    setIsLoadingMore(false);
    lastLoadTimeRef.current = 0;
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
