
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Database, Wifi, Clock } from 'lucide-react';

interface ImprovedInventoryErrorBoundaryProps {
  error: string | Error;
  onRetry?: () => void;
  onClearFilters?: () => void;
  showDatabaseHealth?: boolean;
}

const ImprovedInventoryErrorBoundary = ({ 
  error, 
  onRetry, 
  onClearFilters,
  showDatabaseHealth = true 
}: ImprovedInventoryErrorBoundaryProps) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                        errorMessage.toLowerCase().includes('connection') ||
                        errorMessage.toLowerCase().includes('fetch');
  
  const isTimeoutError = errorMessage.toLowerCase().includes('timeout') ||
                        errorMessage.toLowerCase().includes('timed out') ||
                        errorMessage.toLowerCase().includes('57014');
  
  const isDatabaseError = errorMessage.toLowerCase().includes('database') ||
                         errorMessage.toLowerCase().includes('sql') ||
                         errorMessage.toLowerCase().includes('permission');

  const isAuthError = errorMessage.toLowerCase().includes('sign in') ||
                     errorMessage.toLowerCase().includes('authentication');

  const getErrorIcon = () => {
    if (isAuthError) return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
    if (isTimeoutError) return <Clock className="w-12 h-12 text-orange-500" />;
    if (isNetworkError) return <Wifi className="w-12 h-12 text-orange-500" />;
    if (isDatabaseError) return <Database className="w-12 h-12 text-red-500" />;
    return <AlertTriangle className="w-12 h-12 text-red-500" />;
  };

  const getErrorTitle = () => {
    if (isAuthError) return "Authentication Required";
    if (isTimeoutError) return "Query Timeout";
    if (isNetworkError) return "Connection Issue";
    if (isDatabaseError) return "Database Error";
    return "Something went wrong";
  };

  const getErrorDescription = () => {
    if (isAuthError) {
      return "Please sign in to view your inventory.";
    }
    if (isTimeoutError) {
      return "The query took too long to complete. Try using filters to reduce the amount of data being loaded.";
    }
    if (isNetworkError) {
      return "We're having trouble connecting to our servers. This might be a temporary network issue.";
    }
    if (isDatabaseError) {
      return "There was an issue accessing your data. This might be a permissions or database connectivity problem.";
    }
    return "An unexpected error occurred while loading your inventory.";
  };

  const getSuggestions = () => {
    const suggestions = [];
    
    if (isAuthError) {
      suggestions.push("Sign in to your account");
      suggestions.push("Check if your session has expired");
    } else if (isTimeoutError) {
      suggestions.push("Use search to find specific items");
      suggestions.push("Apply filters to reduce data size");
      suggestions.push("Try loading fewer items at once");
    } else if (isNetworkError) {
      suggestions.push("Check your internet connection");
      suggestions.push("Try refreshing the page");
      suggestions.push("Wait a moment and try again");
    } else if (isDatabaseError) {
      suggestions.push("Try clearing your filters");
      suggestions.push("Sign out and sign back in");
      suggestions.push("Contact support if the issue persists");
    } else {
      suggestions.push("Try refreshing the data");
      suggestions.push("Clear any active filters");
      suggestions.push("Check your internet connection");
    }
    
    return suggestions;
  };

  return (
    <Card className="p-8 text-center max-w-lg mx-auto">
      <div className="flex flex-col items-center space-y-4">
        {getErrorIcon()}
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getErrorTitle()}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {getErrorDescription()}
          </p>
          
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium mb-2">Try these solutions:</p>
            <ul className="text-left space-y-1">
              {getSuggestions().map((suggestion, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
          
          {errorMessage && (
            <details className="text-xs text-gray-500 mb-4">
              <summary className="cursor-pointer mb-2">Technical Details</summary>
              <code className="bg-gray-100 p-2 rounded block text-left break-words">
                {errorMessage}
              </code>
            </details>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap justify-center">
          {onRetry && !isAuthError && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {onClearFilters && (isTimeoutError || isDatabaseError) && (
            <Button onClick={onClearFilters} variant="outline">
              Clear Filters & Retry
            </Button>
          )}
          
          {isAuthError && (
            <Button onClick={() => window.location.href = '/'} variant="default">
              Go to Sign In
            </Button>
          )}
        </div>
        
        {showDatabaseHealth && !isAuthError && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              {isTimeoutError ? 
                "Large datasets can cause timeouts. Using filters will help load data faster." :
                "If this problem persists, it might be a temporary service issue. Try again in a few minutes."
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImprovedInventoryErrorBoundary;
