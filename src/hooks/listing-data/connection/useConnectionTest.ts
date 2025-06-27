
import { supabase } from '@/integrations/supabase/client';

export const useConnectionTest = () => {
  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      const startTime = Date.now();
      
      // Use a simpler, more efficient query for connection testing
      const { data, error } = await supabase
        .from('listings')
        .select('id')
        .limit(1)
        .single();
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Connection test took ${duration}ms`);
        
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is fine
        console.error('❌ Connection test failed:', error);
        return false;
      }
      
      console.log('✅ Connection test successful');
      return true;
    } catch (error: any) {
      console.error('💥 Connection test exception:', error);
      return false;
    }
  };

  return { testConnection };
};
