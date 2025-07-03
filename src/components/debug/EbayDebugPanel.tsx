import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bug, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EbayDebugPanel = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const testEbayConnection = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log('🔍 Testing eBay connection...');

      // Step 1: Check marketplace account
      const { data: ebayAccount, error: accountError } = await supabase
        .from('marketplace_accounts')
        .select('*')
        .eq('platform', 'ebay')
        .eq('is_connected', true)
        .eq('is_active', true)
        .maybeSingle();

      if (accountError) {
        throw new Error(`Account lookup failed: ${accountError.message}`);
      }

      if (!ebayAccount) {
        throw new Error('No eBay account found');
      }

      // Step 2: Test eBay API call
      const testResponse = await fetch('https://api.ebay.com/sell/account/v1/privilege', {
        headers: {
          'Authorization': `Bearer ${ebayAccount.oauth_token}`,
          'Accept': 'application/json'
        }
      });

      const testData = testResponse.ok ? await testResponse.json() : await testResponse.text();

      setResults({
        accountFound: true,
        accountData: {
          username: ebayAccount.account_username,
          tokenLength: ebayAccount.oauth_token?.length,
          expiresAt: ebayAccount.oauth_expires_at,
          isExpired: ebayAccount.oauth_expires_at ? new Date(ebayAccount.oauth_expires_at) < new Date() : false
        },
        apiTest: {
          status: testResponse.status,
          statusText: testResponse.statusText,
          ok: testResponse.ok,
          data: testData
        }
      });

      if (testResponse.ok) {
        toast({
          title: "eBay Connection Healthy ✅",
          description: "Your eBay account is properly connected and API calls are working"
        });
      } else {
        toast({
          title: "eBay API Issue ⚠️",
          description: `API call failed with status ${testResponse.status}`,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('❌ eBay test failed:', error);
      setResults({
        error: error.message,
        accountFound: false
      });
      
      toast({
        title: "eBay Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const testListingSync = async () => {
    try {
      // Get first listing to test with
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, price')
        .limit(1)
        .single();

      if (!listings) {
        toast({
          title: "No Listings Found",
          description: "Create a listing first to test sync functionality",
          variant: "destructive"
        });
        return;
      }

      console.log('🔄 Testing sync with listing:', listings.id);

      // Call eBay integration function
      const { data, error } = await supabase.functions.invoke('ebay-integration', {
        body: {
          action: 'publish_listing',
          listingId: listings.id
        }
      });

      console.log('📦 Sync test response:', { data, error });

      if (error) {
        toast({
          title: "Sync Test Failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data?.status === 'success') {
        toast({
          title: "Sync Test Successful! 🎉",
          description: `Listing "${listings.title}" synced to eBay`
        });
      } else {
        toast({
          title: "Sync Test Issue",
          description: data?.error || 'Unknown sync error',
          variant: "destructive"
        });
      }

    } catch (error: any) {
      toast({
        title: "Sync Test Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          eBay Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testEbayConnection}
            disabled={testing}
            variant="outline"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test eBay Connection'
            )}
          </Button>
          
          <Button 
            onClick={testListingSync}
            disabled={testing}
          >
            Test Listing Sync
          </Button>
        </div>

        {results && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">Test Results:</h3>
            
            {results.error ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{results.error}</span>
              </div>
            ) : (
              <>
                {results.accountFound && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>eBay Account Found</span>
                    </div>
                    <div className="ml-6 space-y-1 text-sm">
                      <p><strong>Username:</strong> {results.accountData.username}</p>
                      <p><strong>Token Length:</strong> {results.accountData.tokenLength} chars</p>
                      <p><strong>Expires:</strong> {results.accountData.expiresAt}</p>
                      <Badge variant={results.accountData.isExpired ? "destructive" : "secondary"}>
                        {results.accountData.isExpired ? "Expired" : "Valid"}
                      </Badge>
                    </div>
                  </div>
                )}

                {results.apiTest && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {results.apiTest.ok ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>eBay API Test Passed</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>eBay API Test Failed</span>
                        </>
                      )}
                    </div>
                    <div className="ml-6 space-y-1 text-sm">
                      <p><strong>Status:</strong> {results.apiTest.status} {results.apiTest.statusText}</p>
                      <details>
                        <summary className="cursor-pointer hover:text-blue-600">View Response</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(results.apiTest.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EbayDebugPanel;