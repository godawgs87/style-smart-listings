
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

    // Start with extremely small limits and longer timeouts
    const requestedLimit = options.limit || 25;
    
    // Much more aggressive progressive strategies
    const queryStrategies = [
      // Strategy 1: Absolute minimum - just IDs and titles
      {
        fields: 'id, title, price, status',
        timeout: 15000, // 15 seconds
        limit: Math.min(5, requestedLimit), // Start with just 5 items
        description: 'ultra-minimal query'
      },
      // Strategy 2: Basic info only
      {
        fields: 'id, title, price, status, created_at',
        timeout: 20000, // 20 seconds
        limit: Math.min(10, requestedLimit),
        description: 'basic fields only'
      },
      // Strategy 3: Add photos if connection allows
      {
        fields: 'id, title, price, status, created_at, photos',
        timeout: 30000, // 30 seconds
        limit: Math.min(15, requestedLimit),
        description: 'with photos'
      }
    ];

    // Try each strategy in sequence
    for (let i = queryAttempts; i < queryStrategies.length; i++) {
      const strategy = queryStrategies[i];
      
      try {
        console.log(`🔄 Attempting ${strategy.description} (${strategy.limit} items, ${strategy.timeout}ms timeout)`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log(`⏰ Timeout reached for ${strategy.description}`);
          controller.abort();
        }, strategy.timeout);

        let query = supabase
          .from('listings')
          .select(strategy.fields)
          .eq('user_id', user.id)
          .abortSignal(controller.signal);

        // Apply only the most selective filters first
        if (options.statusFilter && options.statusFilter !== 'all') {
          query = query.eq('status', options.statusFilter);
        }

        // Skip complex filters for minimal queries
        if (i > 0) {
          if (options.categoryFilter && options.categoryFilter !== 'all') {
            query = query.eq('category', options.categoryFilter);
          }
          if (options.searchTerm?.trim()) {
            query = query.ilike('title', `%${options.searchTerm.trim()}%`);
          }
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(strategy.limit);

        clearTimeout(timeoutId);

        if (error) {
          console.error(`❌ ${strategy.description} failed:`, error);
          
          // If it's a timeout/cancellation error, try next strategy
          if (error.message?.includes('canceled') || error.code === '57014') {
            console.log('Query was cancelled, trying next strategy...');
            continue;
          }
          
          // For other errors, continue to next strategy
          continue;
        }

        console.log(`✅ ${strategy.description} succeeded: ${data?.length || 0} items loaded`);
        
        // Transform data with minimal processing to avoid delays
        const transformedListings: Listing[] = (data || []).map(item => {
          if (!item || typeof item !== 'object') {
            console.warn('Invalid item received:', item);
            return createDefaultListing(user.id);
          }

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
        
        // Show user what level of data they're getting
        if (i > 0) {
          toast({
            title: `Limited Data (${strategy.description})`,
            description: `Loaded ${transformedListings.length} items with ${strategy.description} due to connection constraints.`,
            variant: "default"
          });
        }

        return { listings: transformedListings, error: null, usedFallback: i > 0 };

      } catch (error: any) {
        console.error(`💥 ${strategy.description} error:`, error);
        
        if (error.name === 'AbortError') {
          console.log(`Query was aborted due to timeout (${strategy.timeout}ms), trying next strategy...`);
          continue;
        }
        
        // For any other error, continue to next strategy
        continue;
      }
    }

    // All strategies failed
    console.error('🚫 All query strategies exhausted');
    setQueryAttempts(prev => Math.min(prev + 1, queryStrategies.length - 1));
    
    return {
      listings: [],
      error: 'Unable to load inventory due to database timeout. Try refreshing or using search filters to reduce the data load.',
      usedFallback: false
    };
  }, [queryAttempts, toast]);

  const resetQueryAttempts = useCallback(() => {
    console.log('🔄 Resetting query attempts');
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
