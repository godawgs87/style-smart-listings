
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Settings, WifiOff, LogOut, Database } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import { useToast } from '@/hooks/use-toast';
import { fallbackDataService } from '@/services/fallbackDataService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface InventoryTimeoutErrorProps {
  onBack: () => void;
  onRetry: () => void;
  onForceOffline?: () => void;
  error?: string;
}

const InventoryTimeoutError = ({ onBack, onRetry, onForceOffline, error }: InventoryTimeoutErrorProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const hasFallbackData = fallbackDataService.hasFallbackData();
  const [testResults, setTestResults] = useState<string>('');
  const [isRunningTest, setIsRunningTest] = useState(false);

  const isAuthError = error?.includes('Authentication') || error?.includes('JWT') || error?.includes('auth');

  const handleDetailedTest = async () => {
    setIsRunningTest(true);
    setTestResults('');
    
    let results = '🔍 DETAILED CONNECTION TEST\n';
    results += `📅 ${new Date().toISOString()}\n\n`;
    
    try {
      // Test 1: Basic connection
      results += '1️⃣ Testing basic connection...\n';
      const { data: basicData, error: basicError } = await supabase
        .from('listings')
        .select('id')
        .limit(1);
      
      if (basicError) {
        results += `❌ Basic connection failed: ${basicError.message}\n`;
        results += `   Code: ${basicError.code}\n`;
        results += `   Details: ${basicError.details}\n`;
      } else {
        results += `✅ Basic connection successful (${basicData?.length || 0} rows)\n`;
      }
      
      // Test 2: Auth check
      results += '\n2️⃣ Testing authentication...\n';
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        results += `❌ Auth check failed: ${authError.message}\n`;
      } else if (user) {
        results += `✅ User authenticated: ${user.email}\n`;
      } else {
        results += `❌ No authenticated user\n`;
      }
      
      // Test 3: Full query
      results += '\n3️⃣ Testing full query...\n';
      const { data: fullData, error: fullError } = await supabase
        .from('listings')
        .select('*')
        .limit(5);
      
      if (fullError) {
        results += `❌ Full query failed: ${fullError.message}\n`;
        results += `   Code: ${fullError.code}\n`;
      } else {
        results += `✅ Full query successful (${fullData?.length || 0} rows)\n`;
      }
      
      // Test 4: Network info
      results += '\n4️⃣ Network information...\n';
      results += `📡 Supabase URL: https://ekzaaptxfwixgmbrooqr.supabase.co\n`;
      results += `🔑 API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n`;
      results += `🌐 Online: ${navigator.onLine}\n`;
      
    } catch (err: any) {
      results += `💥 Test exception: ${err.message}\n`;
    }
    
    setTestResults(results);
    setIsRunningTest(false);
    
    console.log(results);
  };

  const handleRetry = () => {
    console.log('🔄 Manual retry triggered from error screen');
    toast({
      title: "Retrying...",
      description: "Attempting database connection..."
    });
    onRetry();
  };

  const handleOfflineMode = () => {
    console.log('🔌 Switching to offline mode...');
    if (onForceOffline) {
      onForceOffline();
    }
  };

  const handleClearCache = () => {
    console.log('🧹 Clearing cache and retrying...');
    fallbackDataService.clearFallbackData();
    localStorage.clear();
    
    toast({
      title: "Cache Cleared",
      description: "Attempting fresh connection..."
    });
    
    setTimeout(() => {
      onRetry();
    }, 1000);
  };

  const handleSignOut = async () => {
    console.log('👋 Signing out...');
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "Please sign back in to continue"
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="max-w-2xl mx-auto">
            <AlertTriangle className={`w-16 h-16 mx-auto mb-4 ${isAuthError ? 'text-orange-500' : 'text-red-500'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isAuthError ? 'text-orange-700' : 'text-red-700'}`}>
              {isAuthError ? 'Authentication Error' : 'Database Connection Error'}
            </h3>
            <p className={`mb-6 ${isAuthError ? 'text-orange-600' : 'text-red-600'}`}>
              {error || 'Unable to connect to the database'}
            </p>
            
            <div className="space-y-3 mb-6">
              {isAuthError ? (
                <>
                  <Button onClick={handleSignOut} className="w-full" variant="default">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out & Log Back In
                  </Button>
                  <Button onClick={handleRetry} className="w-full" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleDetailedTest} 
                    className="w-full" 
                    variant="default"
                    disabled={isRunningTest}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    {isRunningTest ? 'Running Test...' : 'Run Detailed Test'}
                  </Button>
                  
                  <Button onClick={handleRetry} className="w-full" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Database Again
                  </Button>
                  
                  {hasFallbackData && onForceOffline && (
                    <Button onClick={handleOfflineMode} className="w-full" variant="outline">
                      <WifiOff className="w-4 h-4 mr-2" />
                      Work Offline (Cached Data)
                    </Button>
                  )}
                </>
              )}
              
              <Button onClick={handleClearCache} className="w-full" variant="secondary">
                <Settings className="w-4 h-4 mr-2" />
                Clear Cache & Retry
              </Button>
            </div>

            {testResults && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left">
                <h4 className="font-medium text-gray-800 mb-2">Test Results:</h4>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {testResults}
                </pre>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h4 className="font-medium text-blue-800 mb-2">Debug Information:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Error: {error || 'Unknown'}</div>
                <div>Has Cached Data: {hasFallbackData ? 'Yes' : 'No'}</div>
                <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
                <div>Check browser console for detailed logs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTimeoutError;
