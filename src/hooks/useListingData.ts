
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
      console.log(`Starting database fetch for ${limit} items...`);
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      // Check authentication with detailed logging
      console.log('Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error:', authError);
        setError('Authentication failed: ' + authError.message);
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.error('No authenticated user found');
        setError('Please log in to view your listings');
        setLoading(false);
        return;
      }
      
      console.log('User authenticated:', user.id);
      
      // Extended timeout for initial queries with RLS
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout after 15 seconds')), 15000)
      );

      // Build query with proper logging
      console.log('Building database query...');
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters with logging
      if (statusFilter && statusFilter !== 'all') {
        console.log('Applying status filter:', statusFilter);
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter && categoryFilter !== 'all') {
        console.log('Applying category filter:', categoryFilter);
        query = query.eq('category', categoryFilter);
      }

      if (searchTerm && searchTerm.trim()) {
        console.log('Applying search filter:', searchTerm);
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      console.log('Executing database query...');
      const queryStartTime = Date.now();
      
      const result = await Promise.race([query, timeoutPromise]);
      const { data, error: fetchError } = result as any;
      
      const queryTime = Date.now() - queryStartTime;
      console.log(`Database query completed in ${queryTime}ms`);

      if (fetchError) {
        console.error('Database query failed:', fetchError);
        
        // Check if it's an RLS policy error
        if (fetchError.message.includes('policy') || fetchError.message.includes('permission')) {
          setError('Access denied: Unable to fetch your listings. Please try logging out and back in.');
          toast({
            title: "Access Error",
            description: "Unable to access your listings. Please try logging out and logging back in.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        throw new Error(`Database query failed: ${fetchError.message}`);
      }

      if (!data) {
        console.log('No data returned from query');
        setListings([]);
        setError(null);
        setLoading(false);
        return;
      }

      console.log(`Successfully loaded ${data.length} listings from database`);
      
      const transformedListings = data.map(transformListing);
      setListings(transformedListings);
      setError(null);
      
      // Save successful data as fallback for future use
      fallbackDataService.saveFallbackData(data);
      
    } catch (error: any) {
      console.error('Database fetch failed:', error);
      
      // Only use fallback for actual connection/timeout errors
      if (error.message.includes('timeout') || error.message.includes('network') || error.message.includes('fetch')) {
        console.log('Connection error detected, switching to fallback...');
        loadFallbackData();
      } else {
        // For other errors (like RLS), show the actual error
        setError(error.message || 'Failed to load listings');
        toast({
          title: "Error Loading Listings",
          description: error.message || 'An unexpected error occurred',
          variant: "destructive"
        });
      }
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
