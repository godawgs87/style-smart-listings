
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { Listing } from '@/types/Listing';

type SupabaseListing = Database['public']['Tables']['listings']['Row'];

interface UseListingDataOptions {
  statusFilter?: string;
  limit?: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useListingData = (options: UseListingDataOptions = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { statusFilter, limit = 10, searchTerm, categoryFilter } = options;

  const transformListing = (supabaseListing: any): Listing => {
    return {
      ...supabaseListing,
      measurements: supabaseListing.measurements || {},
      photos: supabaseListing.photos || [],
      keywords: supabaseListing.keywords || [],
      shipping_cost: supabaseListing.shipping_cost,
      description: supabaseListing.description || null,
      purchase_date: undefined,
      source_location: undefined,
      source_type: undefined,
      cost_basis: undefined,
      fees_paid: undefined,
      sold_date: undefined,
      sold_price: undefined,
      days_to_sell: undefined,
      performance_notes: undefined,
      price_research: null,
      updated_at: supabaseListing.created_at,
      user_id: '',
      consignor_name: undefined,
      consignor_contact: undefined,
      listed_date: undefined
    };
  };

  const fetchListings = async () => {
    try {
      console.log('Starting progressive query with options:', { statusFilter, limit, searchTerm, categoryFilter });
      setLoading(true);
      setError(null);
      
      // Progressive loading strategy - start with essential fields only
      let query = supabase
        .from('listings')
        .select('id, title, price, status, created_at, category, condition, description, photos')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters one at a time to reduce query complexity
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      } else if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      } else if (searchTerm && searchTerm.trim()) {
        // Simple title search only
        query = query.ilike('title', `%${searchTerm.trim()}%`);
      }

      console.log('Executing progressive query with 10 second timeout...');
      
      // Set reasonable timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
      );

      const queryPromise = query;

      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { data, error: fetchError } = result as any;

      if (fetchError) {
        console.error('Database query error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned from progressive query');
        setListings([]);
        return;
      }

      console.log(`Successfully loaded ${data.length} listings with progressive loading`);
      
      // Transform data with defaults for missing fields
      const transformedListings = data.map(item => ({
        ...item,
        description: item.description || null,
        purchase_price: undefined,
        purchase_date: undefined,
        source_location: undefined,
        source_type: undefined,
        cost_basis: undefined,
        fees_paid: undefined,
        sold_date: undefined,
        sold_price: undefined,
        days_to_sell: undefined,
        performance_notes: undefined,
        measurements: {},
        keywords: [],
        price_research: null,
        shipping_cost: 9.95,
        updated_at: item.created_at,
        user_id: '',
        consignor_name: undefined,
        consignor_contact: undefined,
        listed_date: undefined,
        is_consignment: undefined,
        consignment_percentage: undefined,
        net_profit: undefined,
        profit_margin: undefined,
        photos: item.photos || []
      })) as Listing[];
      
      setListings(transformedListings);
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      
      let errorMessage = 'Failed to load inventory';
      
      if (error.message?.includes('timeout') || error.message?.includes('Query timeout')) {
        errorMessage = 'timeout: Database query took too long. The progressive loading will help manage this better.';
      } else if (error.message?.includes('connection') || error.message?.includes('network')) {
        errorMessage = 'connection: Unable to connect to the database. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setListings([]);
      
      toast({
        title: "Loading Error",
        description: errorMessage.replace(/^(timeout|connection):\s*/, ''),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('Manual refetch triggered with current options');
    fetchListings();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 500); // Slightly longer debounce for stability

    return () => clearTimeout(timeoutId);
  }, [statusFilter, limit, searchTerm, categoryFilter]);

  return {
    listings,
    setListings,
    loading,
    error,
    fetchListings,
    refetch
  };
};
