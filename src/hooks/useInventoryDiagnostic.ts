
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useInventoryDiagnostic = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const { toast } = useToast();

  const addDiagnostic = useCallback((message: string) => {
    console.log('🔍 DIAGNOSTIC:', message);
    setDiagnostics(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  }, []);

  const testInventoryLoad = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setListings([]);
      
      addDiagnostic('Starting inventory diagnostic...');
      
      // Step 1: Test auth
      addDiagnostic('Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        addDiagnostic(`Auth error: ${authError.message}`);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        addDiagnostic('No user found - not authenticated');
        throw new Error('Not authenticated');
      }
      
      addDiagnostic(`User authenticated: ${user.id}`);
      
      // Step 2: Test basic query
      addDiagnostic('Testing basic listings query...');
      const { data, error: queryError, count } = await supabase
        .from('listings')
        .select('id, title, user_id', { count: 'exact' })
        .eq('user_id', user.id)
        .limit(5);
      
      if (queryError) {
        addDiagnostic(`Query error: ${queryError.message}`);
        throw new Error(`Database query failed: ${queryError.message}`);
      }
      
      addDiagnostic(`Query successful. Found ${count} total records, returning ${data?.length || 0} items`);
      
      if (data && data.length > 0) {
        addDiagnostic(`Sample record: ${JSON.stringify(data[0])}`);
      }
      
      // Step 3: Test full query
      addDiagnostic('Testing full listings query...');
      const { data: fullData, error: fullError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          category,
          condition,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (fullError) {
        addDiagnostic(`Full query error: ${fullError.message}`);
        throw new Error(`Full query failed: ${fullError.message}`);
      }
      
      addDiagnostic(`Full query successful. Retrieved ${fullData?.length || 0} records`);
      
      setListings(fullData || []);
      addDiagnostic('Diagnostic completed successfully');
      
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      addDiagnostic(`Error occurred: ${errorMessage}`);
      setError(errorMessage);
      
      toast({
        title: "Diagnostic Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [addDiagnostic, toast]);

  useEffect(() => {
    testInventoryLoad();
  }, [testInventoryLoad]);

  return {
    loading,
    error,
    listings,
    diagnostics,
    retry: testInventoryLoad
  };
};
