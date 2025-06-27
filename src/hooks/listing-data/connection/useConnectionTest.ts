
import { supabase } from '@/integrations/supabase/client';

export const useConnectionTest = () => {
  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('listings')
        .select('id')
        .limit(1);
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Connection test took ${duration}ms`);
        
      if (error) {
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
