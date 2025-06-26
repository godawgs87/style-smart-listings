
// Fallback service for when database is unavailable
export interface FallbackListing {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  category?: string;
  condition?: string;
  description?: string;
  photos?: string[];
  measurements?: any;
  keywords?: string[];
  shipping_cost?: number;
}

const FALLBACK_KEY = 'inventory_fallback_data';
const FALLBACK_TIMESTAMP_KEY = 'inventory_fallback_timestamp';

export const fallbackDataService = {
  // Save successful data to localStorage as backup
  saveFallbackData: (listings: any[]) => {
    try {
      const fallbackData = listings.map(listing => ({
        id: listing.id,
        title: listing.title || 'Untitled Item',
        price: listing.price || 0,
        status: listing.status || 'draft',
        created_at: listing.created_at,
        category: listing.category,
        condition: listing.condition,
        description: listing.description,
        photos: listing.photos || [],
        measurements: listing.measurements || {},
        keywords: listing.keywords || [],
        shipping_cost: listing.shipping_cost
      }));
      
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallbackData));
      localStorage.setItem(FALLBACK_TIMESTAMP_KEY, Date.now().toString());
      console.log('Fallback data saved:', fallbackData.length, 'items');
    } catch (error) {
      console.error('Failed to save fallback data:', error);
    }
  },

  // Load fallback data when database is unavailable
  loadFallbackData: (): FallbackListing[] => {
    try {
      const data = localStorage.getItem(FALLBACK_KEY);
      const timestamp = localStorage.getItem(FALLBACK_TIMESTAMP_KEY);
      
      if (!data) {
        return [];
      }

      const parsedData = JSON.parse(data);
      const dataAge = Date.now() - parseInt(timestamp || '0');
      const isStale = dataAge > 24 * 60 * 60 * 1000; // 24 hours

      console.log('Loading fallback data:', parsedData.length, 'items', isStale ? '(stale)' : '(fresh)');
      return parsedData;
    } catch (error) {
      console.error('Failed to load fallback data:', error);
      return [];
    }
  },

  // Check if fallback data exists
  hasFallbackData: (): boolean => {
    return localStorage.getItem(FALLBACK_KEY) !== null;
  },

  // Clear fallback data
  clearFallbackData: () => {
    localStorage.removeItem(FALLBACK_KEY);
    localStorage.removeItem(FALLBACK_TIMESTAMP_KEY);
    console.log('Fallback data cleared');
  }
};
