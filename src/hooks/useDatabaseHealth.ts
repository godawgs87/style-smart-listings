
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseHealth {
  isHealthy: boolean;
  responseTime: number | null;
  lastChecked: Date | null;
  errorCount: number;
}

export const useDatabaseHealth = () => {
  const [health, setHealth] = useState<DatabaseHealth>({
    isHealthy: false,
    responseTime: null,
    lastChecked: null,
    errorCount: 0
  });

  const checkHealth = async () => {
    const startTime = Date.now();
    
    try {
      // Simple health check query
      const { data, error } = await supabase
        .from('listings')
        .select('id')
        .limit(1)
        .single();
      
      const responseTime = Date.now() - startTime;
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" which is OK
        throw error;
      }
      
      setHealth(prev => ({
        isHealthy: true,
        responseTime,
        lastChecked: new Date(),
        errorCount: Math.max(0, prev.errorCount - 1) // Gradually reduce error count on success
      }));
      
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      
      setHealth(prev => ({
        isHealthy: false,
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        errorCount: prev.errorCount + 1
      }));
      
      return false;
    }
  };

  useEffect(() => {
    // Initial health check
    checkHealth();
    
    // Periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    health,
    checkHealth
  };
};
