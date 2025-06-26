
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
      
      // Enhanced authentication check with better error handling
      console.log('Checking authentication status...');
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error details:', authError);
        setError(`Authentication failed: ${authError.message}`);
        setLoading(false);
        toast({
          title: "Authentication Error",
          description: `Please try logging out and back in: ${authError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      if (!authData?.user) {
        console.error('No authenticated user found');
        setError('Please log in to view your listings');
        setLoading(false);
        toast({
          title: "Authentication Required",
          description: "Please log in to access your inventory",
          variant: "destructive"
        });
        return;
      }
      
      console.log('User authenticated successfully:', authData.user.id);
      console.log('User email:', authData.user.email);
      
      // Set reasonable timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout after 10 seconds')), 10000)
      );

      // Build comprehensive query with detailed logging
      console.log('Building database query with filters:', {
        statusFilter,
        categoryFilter,
        searchTerm,
        limit
      });
      
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 50)); // Reasonable limit

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
        console.error('Database query error details:', fetchError);
        
        // Enhanced error handling for different error types
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('policy')) {
          setError('Access denied: Row Level Security policy violation. Check your permissions.');
          toast({
            title: "Permission Error",
            description: "Unable to access your data. This might be a configuration issue.",
            variant: "destructive"
          });
        } else if (fetchError.message.includes('JWT')) {
          setError('Authentication token issue. Please log out and back in.');
          toast({
            title: "Token Error", 
            description: "Please sign out and sign back in to refresh your session.",
            variant: "destructive"
          });
        } else {
          throw new Error(`Database error: ${fetchError.message} (Code: ${fetchError.code || 'unknown'})`);
        }
        
        setLoading(false);
        return;
      }

      if (!data) {
        console.log('Query successful but no data returned');
        setListings([]);
        setError(null);
        setLoading(false);
        return;
      }

      console.log(`Successfully loaded ${data.length} complete listings from database`);
      console.log('Sample data fields:', data.length > 0 ? Object.keys(data[0]) : 'No data');
      
      // Transform and validate the data
      const transformedListings = data.map(transformListing);
      console.log('Transformed listings sample:', transformedListings.length > 0 ? transformedListings[0] : 'No listings');
      
      setListings(transformedListings);
      setError(null);
      
      // Save successful data for fallback
      fallbackDataService.saveFallbackData(data);
      
    } catch (error: any) {
      console.error('Database fetch failed with error:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', error.message, error.code);
      
      // Enhanced fallback logic
      if (error.message.includes('timeout') || 
          error.message.includes('network') || 
          error.message.includes('fetch') ||
          error.message.includes('Connection')) {
        console.log('Connection/timeout error detected, switching to fallback data...');
        loadFallbackData();
      } else {
        // For other errors, show the actual error
        setError(error.message || 'Failed to load listings');
        toast({
          title: "Database Error",
          description: error.message || 'An unexpected error occurred while loading your listings',
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
