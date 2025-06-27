
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConnectionTest } from '../listing-data/connection/useConnectionTest';

export const useConnectionRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<'good' | 'slow' | 'poor'>('good');
  const { toast } = useToast();
  const { testConnection } = useConnectionTest();

  const handleConnectionError = useCallback(async (error: any) => {
    console.log('🔌 Handling connection error:', error);
    
    // Check if it's a timeout or connection error
    const isTimeout = error.code === '57014' || 
                     error.message?.includes('timeout') || 
                     error.message?.includes('canceled') ||
                     error.message?.includes('statement timeout');
    
    if (isTimeout) {
      setConnectionHealth('poor');
      
      toast({
        title: "Database Timeout",
        description: "Query took too long. Try using filters to reduce data load.",
        variant: "destructive"
      });
      
      return { 
        shouldRetry: false, 
        useOffline: true,
        errorType: 'timeout' as const
      };
    }
    
    // For other connection errors, test the connection
    setIsRecovering(true);
    
    try {
      const isHealthy = await testConnection();
      
      if (isHealthy) {
        setConnectionHealth('good');
        return { 
          shouldRetry: true, 
          useOffline: false,
          errorType: 'recoverable' as const
        };
      } else {
        setConnectionHealth('poor');
        return { 
          shouldRetry: false, 
          useOffline: true,
          errorType: 'connection' as const
        };
      }
    } finally {
      setIsRecovering(false);
    }
  }, [toast, testConnection]);

  const getOptimalQuerySettings = useCallback(() => {
    switch (connectionHealth) {
      case 'poor':
        return { limit: 10, timeout: 3000, useMinimalFields: true };
      case 'slow':
        return { limit: 15, timeout: 5000, useMinimalFields: true };
      default:
        return { limit: 25, timeout: 8000, useMinimalFields: false };
    }
  }, [connectionHealth]);

  return {
    handleConnectionError,
    getOptimalQuerySettings,
    isRecovering,
    connectionHealth
  };
};
