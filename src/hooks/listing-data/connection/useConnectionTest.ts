
import { supabase } from '@/integrations/supabase/client';

export const useConnectionTest = () => {
  const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
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
        return { success: false, error: error.message };
      }
      
      console.log('✅ Connection test successful');
      return { success: true };
    } catch (error: any) {
      console.error('💥 Connection test exception:', error);
      return { success: false, error: error.message };
    }
  };

  return { testConnection };
};
