
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const LoadingState = ({ 
  message = 'Loading...', 
  size = 'md',
  fullPage = false 
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const containerClasses = fullPage 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'p-8 text-center';

  const Component = fullPage ? 'div' : Card;

  return (
    <Component className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </Component>
  );
};

export default LoadingState;
