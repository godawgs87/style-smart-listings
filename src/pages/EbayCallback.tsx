import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const EbayCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`eBay OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from eBay');
        }

        console.log('Processing eBay OAuth callback with code:', code);

        // Exchange the authorization code for access token
        const { data, error: exchangeError } = await supabase.functions.invoke('ebay-oauth', {
          body: { 
            action: 'exchange_code',
            code: code,
            state: state
          }
        });

        if (exchangeError) {
          throw exchangeError;
        }

        if (data.success) {
          toast({
            title: "eBay Connected Successfully",
            description: `Your eBay account (${data.username}) is now connected and ready to use`
          });

          // Redirect to settings page
          navigate('/settings');
        } else {
          throw new Error('Failed to complete eBay connection');
        }

      } catch (error: any) {
        console.error('eBay OAuth callback error:', error);
        toast({
          title: "Connection Failed",
          description: error.message || 'Failed to connect your eBay account',
          variant: "destructive"
        });

        // Redirect to settings page even on error
        navigate('/settings');
      } finally {
        setProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <h2 className="text-xl font-semibold">Connecting to eBay</h2>
          <p className="text-gray-600">
            {processing 
              ? "Please wait while we complete your eBay connection..."
              : "Connection processed. Redirecting..."
            }
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EbayCallback;