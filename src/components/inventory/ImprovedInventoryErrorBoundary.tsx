
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Database, Wifi } from 'lucide-react';

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
                        errorMessage.toLowerCase().includes('timeout');
  
  const isDatabaseError = errorMessage.toLowerCase().includes('database') ||
                         errorMessage.toLowerCase().includes('sql') ||
                         errorMessage.toLowerCase().includes('permission');

  const getErrorIcon = () => {
    if (isNetworkError) return <Wifi className="w-12 h-12 text-orange-500" />;
    if (isDatabaseError) return <Database className="w-12 h-12 text-red-500" />;
    return <AlertTriangle className="w-12 h-12 text-red-500" />;
  };

  const getErrorTitle = () => {
    if (isNetworkError) return "Connection Issue";
    if (isDatabaseError) return "Database Error";
    return "Something went wrong";
  };

  const getErrorDescription = () => {
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
    
    if (isNetworkError) {
      suggestions.push("Check your internet connection");
      suggestions.push("Try refreshing the page");
    } else if (isDatabaseError) {
      suggestions.push("Try clearing your filters");
      suggestions.push("Sign out and sign back in");
    } else {
      suggestions.push("Try refreshing the data");
      suggestions.push("Clear any active filters");
    }
    
    return suggestions;
  };

  return (
    <Card className="p-8 text-center max-w-md mx-auto">
      <div className="flex flex-col items-center space-y-4">
        {getErrorIcon()}
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getErrorTitle()}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {getErrorDescription()}
          </p>
          
          {errorMessage && (
            <details className="text-xs text-gray-500 mb-4">
              <summary className="cursor-pointer mb-2">Technical Details</summary>
              <code className="bg-gray-100 p-2 rounded block text-left">
                {errorMessage}
              </code>
            </details>
          )}
          
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
        </div>
        
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {onClearFilters && !isNetworkError && (
            <Button onClick={onClearFilters} variant="outline">
              Clear Filters
            </Button>
          )}
        </div>
        
        {showDatabaseHealth && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              If this problem persists, it might be a temporary service issue. 
              Try again in a few minutes.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImprovedInventoryErrorBoundary;
