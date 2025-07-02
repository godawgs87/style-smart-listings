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

        console.log('eBay OAuth callback received:', { 
          code: code ? 'present' : 'missing', 
          state: state ? 'present' : 'missing', 
          error 
        });

        if (error) {
          throw new Error(`eBay OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from eBay');
        }

        console.log('Processing eBay OAuth callback with code:', code);

        // Get current session for authentication - with retry logic
        let session = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!session && attempts < maxAttempts) {
          attempts++;
          console.log(`Attempting to get session (attempt ${attempts}/${maxAttempts})`);
          
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            throw new Error(`Session error: ${sessionError.message}`);
          }
          
          session = currentSession;
          
          if (!session && attempts < maxAttempts) {
            console.log('No session found, waiting 1 second before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!session) {
          // User is not authenticated, store the OAuth data and redirect to login
          console.log('No session found after retries, storing OAuth data for later');
          localStorage.setItem('ebay_oauth_pending', JSON.stringify({ code, state }));
          toast({
            title: "Please Log In",
            description: "You need to be logged in to complete the eBay connection. Please sign in first.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        console.log('Session found, proceeding with token exchange:', {
          userId: session.user?.id,
          tokenPresent: !!session.access_token
        });

        const requestBody = { 
          action: 'exchange_code',
          code: code,
          state: state
        };
        
        console.log('Sending request to ebay-oauth with body:', requestBody);

        // Exchange the authorization code for access token - FIXED: Use direct fetch
        const response = await fetch(`https://ekzaaptxfwixgmbrooqr.supabase.co/functions/v1/ebay-oauth`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVremFhcHR4ZndpeGdtYnJvb3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODI2NzksImV4cCI6MjA2NjI1ODY3OX0.C5ivIgxoapGcsGpZJo_hOF9XUzRuXeVgyCbmawDeCes'
          },
          body: JSON.stringify({
            action: 'exchange_code',
            code: code,
            state: state
          })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Function returned error:', errorText);
          throw new Error(`Function error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Token exchange response:', data);
        
        if (data?.success) {
          // Clear any pending OAuth data
          localStorage.removeItem('ebay_oauth_pending');
          
          toast({
            title: "eBay Connected Successfully",
            description: `Your eBay account (${data.username}) is now connected and ready to use`
          });

          // Redirect to settings page
          navigate('/settings');
        } else {
          console.error('eBay connection failed - missing success flag in response:', data);
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
          <h2 className="text-xl font-semibold">
            {processing ? "Connecting to eBay" : "Processing Complete"}
          </h2>
          <p className="text-gray-600">
            {processing 
              ? "Please wait while we complete your eBay connection..."
              : "Redirecting you back to settings..."
            }
          </p>
          {!processing && (
            <div className="mt-4">
              <button 
                onClick={() => navigate('/settings')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Continue to Settings
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EbayCallback;