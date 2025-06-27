
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/types/Listing';

interface QueryOptions {
  statusFilter?: string;
  categoryFilter?: string;
  searchTerm?: string;
  limit?: number;
}

export const useProgressiveQuery = () => {
  const [queryAttempts, setQueryAttempts] = useState(0);
  const { toast } = useToast();

  const fetchWithProgressiveDegradation = useCallback(async (options: QueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
    usedFallback: boolean;
  }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { listings: [], error: 'No authenticated user', usedFallback: false };
    }

    const limit = Math.min(options.limit || 25, 25);
    
    // Progressive query strategies - start simple, get more complex
    const queryStrategies = [
      // Strategy 1: Minimal fields, small limit
      {
        fields: 'id, title, price, status, created_at',
        timeout: 3000,
        limit: Math.min(limit, 10),
        description: 'minimal query'
      },
      // Strategy 2: Essential fields, medium limit
      {
        fields: 'id, title, price, status, category, created_at, photos',
        timeout: 5000,
        limit: Math.min(limit, 15),
        description: 'essential fields'
      },
      // Strategy 3: Full fields (if connection is good)
      {
        fields: 'id, title, price, status, category, created_at, photos, description, purchase_price, net_profit, profit_margin, shipping_cost',
        timeout: 8000,
        limit: limit,
        description: 'full query'
      }
    ];

    // Try each strategy in sequence
    for (let i = queryAttempts; i < queryStrategies.length; i++) {
      const strategy = queryStrategies[i];
      
      try {
        console.log(`🔄 Attempting ${strategy.description} (attempt ${i + 1}/${queryStrategies.length})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), strategy.timeout);

        let query = supabase
          .from('listings')
          .select(strategy.fields)
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
          .limit(strategy.limit);

        clearTimeout(timeoutId);

        if (error) {
          console.error(`❌ ${strategy.description} failed:`, error);
          continue; // Try next strategy
        }

        console.log(`✅ ${strategy.description} succeeded: ${data?.length || 0} items`);
        
        // Transform data to match Listing interface with proper type checking
        const transformedListings: Listing[] = (data || []).map(item => {
          // Ensure we have a valid data item
          if (!item || typeof item !== 'object') {
            console.warn('Invalid item received:', item);
            return createDefaultListing(user.id);
          }

          // Type assertion after validation
          const validItem = item as Record<string, any>;

          return {
            id: validItem.id || '',
            title: validItem.title || 'Untitled',
            price: Number(validItem.price) || 0,
            status: validItem.status || 'draft',
            category: validItem.category || null,
            created_at: validItem.created_at || new Date().toISOString(),
            updated_at: validItem.created_at || new Date().toISOString(),
            measurements: {},
            keywords: [],
            photos: Array.isArray(validItem.photos) ? validItem.photos.filter(p => p && typeof p === 'string') : [],
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
            condition: null,
            shipping_cost: validItem.shipping_cost || null,
            purchase_price: validItem.purchase_price || null,
            net_profit: validItem.net_profit || null,
            profit_margin: validItem.profit_margin || null
          };
        });

        // Reset query attempts on success
        setQueryAttempts(0);
        
        if (i > 0) {
          toast({
            title: "Limited Data Loaded",
            description: `Using ${strategy.description} due to connection constraints.`,
            variant: "default"
          });
        }

        return { listings: transformedListings, error: null, usedFallback: false };

      } catch (error: any) {
        console.error(`💥 ${strategy.description} error:`, error);
        
        if (error.name === 'AbortError') {
          console.log('Query was aborted due to timeout, trying next strategy...');
          continue;
        }
        
        // For non-timeout errors, continue to next strategy
        continue;
      }
    }

    // All strategies failed
    console.error('🚫 All query strategies failed');
    setQueryAttempts(prev => Math.min(prev + 1, queryStrategies.length - 1));
    
    return {
      listings: [],
      error: 'Unable to load inventory. Please check your connection and try again.',
      usedFallback: false
    };
  }, [queryAttempts, toast]);

  const resetQueryAttempts = useCallback(() => {
    setQueryAttempts(0);
  }, []);

  return {
    fetchWithProgressiveDegradation,
    resetQueryAttempts,
    currentQueryLevel: queryAttempts
  };
};

// Helper function to create a default listing
const createDefaultListing = (userId: string): Listing => ({
  id: '',
  title: 'Untitled',
  price: 0,
  status: 'draft',
  category: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  measurements: {},
  keywords: [],
  photos: [],
  user_id: userId,
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
  condition: null,
  shipping_cost: null,
  purchase_price: null,
  net_profit: null,
  profit_margin: null
});
