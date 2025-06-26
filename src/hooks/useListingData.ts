
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
      console.log('Starting ultra-minimal query with options:', { statusFilter, limit, searchTerm, categoryFilter });
      setLoading(true);
      setError(null);
      
      // Check for emergency mode
      const isEmergencyMode = localStorage.getItem('inventory_emergency_mode') === 'true';
      const queryLimit = isEmergencyMode ? 5 : Math.min(limit, 10);
      
      console.log('Emergency mode:', isEmergencyMode, 'Query limit:', queryLimit);
      
      // Ultra-minimal query - only essential fields
      let query = supabase
        .from('listings')
        .select('id, title, price, status, created_at, category, condition')
        .order('created_at', { ascending: false })
        .limit(queryLimit);

      // Only apply one filter at a time to reduce query complexity
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      } else if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      } else if (searchTerm && searchTerm.trim()) {
        // Simple title search only
        query = query.ilike('title', `%${searchTerm.trim()}%`);
      }

      console.log('Executing ultra-minimal query with 5 second timeout...');
      
      // Set aggressive timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
      );

      const queryPromise = query;

      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { data, error: fetchError } = result as any;

      if (fetchError) {
        console.error('Database query error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned from ultra-minimal query');
        setListings([]);
        return;
      }

      console.log(`Successfully loaded ${data.length} listings with ultra-minimal query`);
      
      // Transform minimal data - add missing fields with defaults
      const transformedListings = data.map(item => ({
        ...item,
        description: null,
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
        shipping_cost: null,
        updated_at: item.created_at,
        user_id: '',
        consignor_name: undefined,
        consignor_contact: undefined,
        listed_date: undefined,
        is_consignment: undefined,
        consignment_percentage: undefined,
        net_profit: undefined,
        profit_margin: undefined,
        photos: []
      })) as Listing[];
      
      setListings(transformedListings);
      
      // Clear emergency mode after successful load
      if (isEmergencyMode) {
        localStorage.removeItem('inventory_emergency_mode');
        toast({
          title: "Minimal data loaded",
          description: `Loaded ${transformedListings.length} items in emergency mode.`
        });
      }
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      
      let errorMessage = 'Failed to load inventory';
      
      if (error.message?.includes('timeout') || error.message?.includes('Query timeout')) {
        errorMessage = 'timeout: Database query took too long even with minimal data. Please try again later or contact support.';
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
    }, 300); // Increased debounce to reduce rapid queries

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
