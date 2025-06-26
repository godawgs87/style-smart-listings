
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const DatabaseDiagnostics = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (index: number, status: 'success' | 'error', message: string, details?: any) => {
    setResults(prev => prev.map((result, i) => 
      i === index ? { ...result, status, message, details } : result
    ));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([
      { test: 'Network Connectivity', status: 'pending', message: 'Testing...' },
      { test: 'Supabase URL Reachability', status: 'pending', message: 'Testing...' },
      { test: 'Authentication Status', status: 'pending', message: 'Testing...' },
      { test: 'Basic Database Query', status: 'pending', message: 'Testing...' },
      { test: 'Listings Table Access', status: 'pending', message: 'Testing...' }
    ]);

    // Test 1: Network Connectivity
    try {
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      updateResult(0, 'success', 'Network is accessible');
    } catch (error) {
      updateResult(0, 'error', 'Network connectivity issues detected', error);
    }

    // Test 2: Supabase URL Reachability
    try {
      const response = await fetch('https://ekzaaptxfwixgmbrooqr.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVremFhcHR4ZndpeGdtYnJvb3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODI2NzksImV4cCI6MjA2NjI1ODY3OX0.C5ivIgxoapGcsGpZJo_hOF9XUzRuXeVgyCbmawDeCes'
        }
      });
      
      if (response.ok) {
        updateResult(1, 'success', `Supabase API reachable (Status: ${response.status})`);
      } else {
        updateResult(1, 'error', `Supabase API returned status: ${response.status}`, {
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      updateResult(1, 'error', 'Cannot reach Supabase API endpoint', error);
    }

    // Test 3: Authentication Status
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        updateResult(2, 'error', `Auth error: ${authError.message}`, authError);
      } else if (user) {
        updateResult(2, 'success', `Authenticated as: ${user.email}`);
      } else {
        updateResult(2, 'error', 'No authenticated user found');
      }
    } catch (error) {
      updateResult(2, 'error', 'Authentication check failed', error);
    }

    // Test 4: Basic Database Query
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        updateResult(3, 'error', `Database query failed: ${error.message}`, {
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        updateResult(3, 'success', `Database query successful. Found ${data || 0} records.`);
      }
    } catch (error) {
      updateResult(3, 'error', 'Database query exception', error);
    }

    // Test 5: Listings Table Access
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title')
        .limit(1);
      
      if (error) {
        updateResult(4, 'error', `Listings table access failed: ${error.message}`, {
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        updateResult(4, 'success', `Listings table accessible. Sample data: ${data?.length || 0} rows`);
      }
    } catch (error) {
      updateResult(4, 'error', 'Listings table access exception', error);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Database Connection Diagnostics</h3>
      </div>

      <Button 
        onClick={runDiagnostics} 
        disabled={isRunning}
        className="mb-6 w-full"
      >
        {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{result.test}</div>
                <div className={`text-sm ${
                  result.status === 'success' ? 'text-green-600' : 
                  result.status === 'error' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {result.message}
                </div>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Technical Details</summary>
                    <pre className="text-xs text-gray-600 mt-1 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Environment Info:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div>URL: {window.location.href}</div>
          <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
          <div>User Agent: {navigator.userAgent.substring(0, 100)}...</div>
          <div>Timestamp: {new Date().toISOString()}</div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDiagnostics;
