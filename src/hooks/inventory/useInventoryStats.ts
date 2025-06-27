
import type { Listing } from '@/types/Listing';
import type { InventoryStats } from './types';

export const useInventoryStats = (listings: Listing[]): InventoryStats => {
  return {
    totalItems: listings.length,
    totalValue: listings.reduce((sum, item) => sum + (item.price || 0), 0),
    activeItems: listings.filter(item => item.status === 'active').length,
    draftItems: listings.filter(item => item.status === 'draft').length
  };
};
