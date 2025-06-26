
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';
import { useListingTransforms } from './useListingTransforms';
import type { Listing } from '@/types/Listing';

interface UseDatabaseQueryOptions {
  statusFilter?: string;
  limit: number;
  searchTerm?: string;
  categoryFilter?: string;
}

export const useDatabaseQuery = () => {
  const { toast } = useToast();
  const { transformListing } = useListingTransforms();

  const fetchFromDatabase = async (options: UseDatabaseQueryOptions): Promise<{
    listings: Listing[];
    error: string | null;
  }> => {
    const { statusFilter, limit, searchTerm, categoryFilter } = options;

    try {
      console.log(`Starting database fetch for ${limit} items...`);
      
      // Enhanced authentication check with better error handling
      console.log('Checking authentication status...');
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error details:', authError);
        const errorMessage = `Authentication failed: ${authError.message}`;
        toast({
          title: "Authentication Error",
          description: `Please try logging out and back in: ${authError.message}`,
          variant: "destructive"
        });
        return { listings: [], error: errorMessage };
      }
      
      if (!authData?.user) {
        console.error('No authenticated user found');
        const errorMessage = 'Please log in to view your listings';
        toast({
          title: "Authentication Required",
          description: "Please log in to access your inventory",
          variant: "destructive"
        });
        return { listings: [], error: errorMessage };
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
          const errorMessage = 'Access denied: Row Level Security policy violation. Check your permissions.';
          toast({
            title: "Permission Error",
            description: "Unable to access your data. This might be a configuration issue.",
            variant: "destructive"
          });
          return { listings: [], error: errorMessage };
        } else if (fetchError.message.includes('JWT')) {
          const errorMessage = 'Authentication token issue. Please log out and back in.';
          toast({
            title: "Token Error", 
            description: "Please sign out and sign back in to refresh your session.",
            variant: "destructive"
          });
          return { listings: [], error: errorMessage };
        } else {
          throw new Error(`Database error: ${fetchError.message} (Code: ${fetchError.code || 'unknown'})`);
        }
      }

      if (!data) {
        console.log('Query successful but no data returned');
        return { listings: [], error: null };
      }

      console.log(`Successfully loaded ${data.length} complete listings from database`);
      console.log('Sample data fields:', data.length > 0 ? Object.keys(data[0]) : 'No data');
      
      // Transform and validate the data
      const transformedListings = data.map(transformListing);
      console.log('Transformed listings sample:', transformedListings.length > 0 ? transformedListings[0] : 'No listings');
      
      // Save successful data for fallback
      fallbackDataService.saveFallbackData(data);
      
      return { listings: transformedListings, error: null };
      
    } catch (error: any) {
      console.error('Database fetch failed with error:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', error.message, error.code);
      
      // Enhanced fallback logic
      if (error.message.includes('timeout') || 
          error.message.includes('network') || 
          error.message.includes('fetch') ||
          error.message.includes('Connection')) {
        console.log('Connection/timeout error detected, will switch to fallback data...');
        return { listings: [], error: 'CONNECTION_ERROR' };
      } else {
        // For other errors, show the actual error
        const errorMessage = error.message || 'Failed to load listings';
        toast({
          title: "Database Error",
          description: error.message || 'An unexpected error occurred while loading your listings',
          variant: "destructive"
        });
        return { listings: [], error: errorMessage };
      }
    }
  };

  return {
    fetchFromDatabase
  };
};
