
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useConnectionRecovery } from './useConnectionRecovery';
import { useFallbackData } from '../listing-data/useFallbackData';
import type { Listing } from '@/types/Listing';

interface QueryOptions {
  statusFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  limit?: number;
}

export const useRobustInventoryData = () => {
  const [retryCount, setRetryCount] = useState(0);
  const { handleConnectionError, getOptimalQuerySettings } = useConnectionRecovery();
  const { getFallbackData, hasFallbackData } = useFallbackData();

  const fetchWithRetry = useCallback(async (options: QueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
    usingFallback: boolean;
  }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { listings: [], error: 'No authenticated user', usingFallback: false };
    }

    const optimalSettings = getOptimalQuerySettings();
    const queryLimit = Math.min(options.limit || optimalSettings.limit, optimalSettings.limit);

    console.log('🚀 Robust query with settings:', { 
      ...optimalSettings, 
      actualLimit: queryLimit,
      retryCount 
    });

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), optimalSettings.timeout);

      // Use minimal field selection for better performance
      const fields = optimalSettings.useMinimalFields ? 
        'id, title, price, status, category, created_at, photos' :
        'id, title, price, status, category, created_at, photos, description, purchase_price, net_profit, profit_margin, shipping_cost';

      let query = supabase
        .from('listings')
        .select(fields)
        .eq('user_id', user.id)
        .abortSignal(controller.signal);

      // Apply filters
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.eq('status', options.statusFilter);
      }

      if (options.categoryFilter && options.categoryFilter !== 'all') {
        query = query.eq('category', options.categoryFilter);
      }

      if (options.searchTerm?.trim()) {
        query = query.ilike('title', `%${options.searchTerm.trim()}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(queryLimit);

      clearTimeout(timeoutId);

      if (error) {
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} listings successfully`);
      
      // Transform the data safely
      const transformedListings: Listing[] = (data || []).map(item => {
        // Ensure item is valid and not null
        if (!item || typeof item !== 'object') {
          console.warn('Invalid item received:', item);
          return {
            id: '',
            title: 'Untitled',
            price: 0,
            status: 'draft',
            category: null,
            created_at: new Date().toISOString(),
            measurements: {},
            keywords: [],
            photos: [],
            user_id: user.id,
            description: null,
            purchase_date: null,
            cost_basis: null,
            sold_price: null,
            sold_date: null,
            price_research: null,
            consignment_percentage: null,
            consignor_name: null,
            consignor_contact: null,
            source_location: null,
            source_type: null,
            fees_paid: null,
            listed_date: null,
            days_to_sell: null,
            performance_notes: null,
            is_consignment: false,
            updated_at: new Date().toISOString(),
            condition: null,
            shipping_cost: null,
            purchase_price: null,
            net_profit: null,
            profit_margin: null
          };
        }

        // Type assertion to tell TypeScript that item is not null here
        const validItem = item as Record<string, any>;

        return {
          id: validItem.id || '',
          title: validItem.title || 'Untitled',
          price: Number(validItem.price) || 0,
          status: validItem.status || 'draft',
          category: validItem.category || null,
          created_at: validItem.created_at || new Date().toISOString(),
          measurements: {},
          keywords: [],
          photos: Array.isArray(validItem.photos) ? validItem.photos.filter((p: any) => p && typeof p === 'string') : [],
          user_id: user.id,
          description: validItem.description || null,
          purchase_date: null,
          cost_basis: null,
          sold_price: null,
          sold_date: null,
          price_research: null,
          consignment_percentage: null,
          consignor_name: null,
          consignor_contact: null,
          source_location: null,
          source_type: null,
          fees_paid: null,
          listed_date: null,
          days_to_sell: null,
          performance_notes: null,
          is_consignment: false,
          updated_at: validItem.created_at || new Date().toISOString(),
          condition: null,
          shipping_cost: validItem.shipping_cost || null,
          purchase_price: validItem.purchase_price || null,
          net_profit: validItem.net_profit || null,
          profit_margin: validItem.profit_margin || null
        };
      });

      setRetryCount(0); // Reset on success
      return { listings: transformedListings, error: null, usingFallback: false };

    } catch (error: any) {
      console.error('💥 Query failed:', error);
      
      const recovery = await handleConnectionError(error);
      
      if (recovery.shouldRetry && retryCount < 2) {
        console.log(`🔄 Retrying... attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(options);
      }
      
      if (recovery.useOffline && hasFallbackData()) {
        console.log('📚 Using fallback data due to connection issues');
        const fallbackOptions = {
          statusFilter: options.statusFilter,
          categoryFilter: options.categoryFilter,
          searchTerm: options.searchTerm,
          limit: options.limit || 25
        };
        const fallbackListings = getFallbackData(fallbackOptions);
        return { listings: fallbackListings, error: null, usingFallback: true };
      }
      
      return { 
        listings: [], 
        error: recovery.errorType === 'timeout' ? 
          'Query timeout - try using filters to reduce data size' : 
          'Connection error - please check your internet',
        usingFallback: false 
      };
    }
  }, [handleConnectionError, getOptimalQuerySettings, retryCount, getFallbackData, hasFallbackData]);

  return { fetchWithRetry };
};
