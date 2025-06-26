
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';
import type { Listing } from '@/types/Listing';
import { useListingTransforms } from './useListingTransforms';

interface UseFallbackDataOptions {
  statusFilter?: string;
  limit: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useFallbackData = () => {
  const { toast } = useToast();
  const { transformFallbackListing } = useListingTransforms();

  const loadFallbackData = (options: UseFallbackDataOptions): Listing[] => {
    const { statusFilter, limit, searchTerm, categoryFilter } = options;
    
    console.log('Loading fallback data due to database unavailability...');
    
    const fallbackListings = fallbackDataService.loadFallbackData();
    
    if (fallbackListings.length === 0) {
      toast({
        title: "Offline Mode",
        description: "Database is unavailable and no cached data exists.",
        variant: "destructive"
      });
      return [];
    }

    // Apply basic filtering to fallback data
    let filtered = fallbackListings;
    
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }
    
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Apply limit
    filtered = filtered.slice(0, limit);

    const transformedListings = filtered.map(transformFallbackListing);
    
    toast({
      title: "Offline Mode Active",
      description: `Showing ${transformedListings.length} cached items. Database is currently unavailable.`,
      variant: "default"
    });

    return transformedListings;
  };

  return {
    loadFallbackData
  };
};
