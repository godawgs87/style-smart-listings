
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';
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
  const [usingFallback, setUsingFallback] = useState(false);
  const { toast } = useToast();

  const { statusFilter, limit = 20, searchTerm, categoryFilter } = options;

  const transformListing = (supabaseListing: any): Listing => {
    return {
      ...supabaseListing,
      measurements: supabaseListing.measurements || {},
      photos: supabaseListing.photos || [],
      keywords: supabaseListing.keywords || [],
      shipping_cost: supabaseListing.shipping_cost,
      description: supabaseListing.description || null,
      purchase_date: supabaseListing.purchase_date,
      source_location: supabaseListing.source_location,
      source_type: supabaseListing.source_type,
      cost_basis: supabaseListing.cost_basis,
      fees_paid: supabaseListing.fees_paid,
      sold_date: supabaseListing.sold_date,
      sold_price: supabaseListing.sold_price,
      days_to_sell: supabaseListing.days_to_sell,
      performance_notes: supabaseListing.performance_notes,
      price_research: supabaseListing.price_research,
      updated_at: supabaseListing.updated_at || supabaseListing.created_at,
      user_id: supabaseListing.user_id || '',
      consignor_name: supabaseListing.consignor_name,
      consignor_contact: supabaseListing.consignor_contact,
      listed_date: supabaseListing.listed_date,
      purchase_price: supabaseListing.purchase_price,
      net_profit: supabaseListing.net_profit,
      profit_margin: supabaseListing.profit_margin,
      is_consignment: supabaseListing.is_consignment,
      consignment_percentage: supabaseListing.consignment_percentage
    };
  };

  const transformFallbackListing = (fallbackItem: any): Listing => {
    return {
      id: fallbackItem.id,
      title: fallbackItem.title,
      price: fallbackItem.price,
      status: fallbackItem.status,
      created_at: fallbackItem.created_at,
      category: fallbackItem.category || null,
      condition: fallbackItem.condition || null,
      description: fallbackItem.description || null,
      measurements: {},
      photos: [],
      keywords: [],
      shipping_cost: null,
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
      updated_at: fallbackItem.created_at,
      user_id: '',
      consignor_name: undefined,
      consignor_contact: undefined,
      listed_date: undefined,
      purchase_price: undefined,
      net_profit: undefined,
      profit_margin: undefined,
      is_consignment: undefined,
      consignment_percentage: undefined
    };
  };

  const loadFallbackData = () => {
    console.log('Loading fallback data due to database unavailability...');
    setUsingFallback(true);
    
    const fallbackListings = fallbackDataService.loadFallbackData();
    
    if (fallbackListings.length === 0) {
      setError('Database unavailable and no cached data found');
      setListings([]);
      toast({
        title: "Offline Mode",
        description: "Database is unavailable and no cached data exists.",
        variant: "destructive"
      });
      return;
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
    setListings(transformedListings);
    setError(null);
    
    toast({
      title: "Offline Mode Active",
      description: `Showing ${transformedListings.length} cached items. Database is currently unavailable.`,
      variant: "default"
    });
  };

  const fetchListings = async () => {
    try {
      console.log(`Attempting database connection with timeout for ${limit} items...`);
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      // Check if user is authenticated first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication required for listings access:', authError);
        setError('Please log in to view your listings');
        setLoading(false);
        return;
      }
      
      // Reasonable timeout for database queries
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout - switching to fallback')), 8000)
      );

      // Build comprehensive query - RLS will automatically filter by user_id
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (searchTerm && searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const result = await Promise.race([query, timeoutPromise]);
      const { data, error: fetchError } = result as any;

      if (fetchError) {
        console.error('Database query error, switching to fallback:', fetchError);
        throw new Error(`Database query failed: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned, switching to fallback');
        throw new Error('No data returned');
      }

      console.log(`Successfully loaded ${data.length} listings from database`);
      
      const transformedListings = data.map(transformListing);
      setListings(transformedListings);
      
      // Save successful data as fallback for future use
      fallbackDataService.saveFallbackData(data);
      
    } catch (error: any) {
      console.error('Database fetch failed, using fallback:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    console.log('Manual refetch triggered - clearing fallback and retrying database');
    setUsingFallback(false);
    fetchListings();
  };

  const forceOfflineMode = () => {
    console.log('Forcing offline mode');
    setLoading(true);
    loadFallbackData();
    setLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, limit, searchTerm, categoryFilter]);

  return {
    listings,
    setListings,
    loading,
    error,
    usingFallback,
    fetchListings,
    refetch,
    forceOfflineMode
  };
};
