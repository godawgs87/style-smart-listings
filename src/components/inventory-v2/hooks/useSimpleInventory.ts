
import { useUnifiedInventory } from '@/hooks/useUnifiedInventory';

interface SimpleInventoryOptions {
  searchTerm: string;
  statusFilter: string;
}

export const useSimpleInventory = ({ searchTerm, statusFilter }: SimpleInventoryOptions) => {
  const {
    listings,
    loading,
    error,
    usingFallback,
    stats,
    refetch,
    forceOfflineMode
  } = useUnifiedInventory({
    searchTerm: searchTerm.trim() || undefined,
    statusFilter: statusFilter === 'all' ? undefined : statusFilter,
    limit: 20
  });

  // Transform listings to match SimpleInventory interface
  const transformedListings = listings.map(listing => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    status: listing.status,
    category: listing.category,
    photos: listing.photos,
    created_at: listing.created_at
  }));

  return {
    listings: transformedListings,
    loading,
    error,
    stats,
    refetch,
    usingFallback
  };
};
