
import { supabase } from '@/integrations/supabase/client';

export const useConnectionTest = () => {
  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testing Supabase connection with short timeout...');
      
      const startTime = Date.now();
      
      // Create a promise that will timeout after 3 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection test timeout')), 3000);
      });
      
      // Use the simplest possible query with LIMIT 1
      const queryPromise = supabase
        .from('listings')
        .select('id')
        .limit(1);
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Connection test completed in ${duration}ms`);
      
      // Type guard for Supabase response
      if (result && typeof result === 'object' && 'error' in result) {
        const supabaseResult = result as { error: any; data?: any };
        if (supabaseResult.error && supabaseResult.error.code !== 'PGRST116') {
          console.error('❌ Connection test failed:', supabaseResult.error);
          return false;
        }
      }
      
      console.log('✅ Connection test successful');
      return true;
    } catch (error: any) {
      console.error('💥 Connection test timeout or error:', error);
      return false;
    }
  };

  return { testConnection };
};
