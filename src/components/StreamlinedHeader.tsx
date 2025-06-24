
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Navigation from '@/components/Navigation';

interface StreamlinedHeaderProps {
  title: string;
  userEmail?: string;
  showBack?: boolean;
  onBack?: () => void;
  currentView?: string;
  onNavigate?: (view: 'dashboard' | 'create' | 'listings') => void;
}

const StreamlinedHeader = ({ 
  title, 
  userEmail, 
  showBack = false, 
  onBack,
  currentView,
  onNavigate 
}: StreamlinedHeaderProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Simple mobile header
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          {showBack && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
      </div>
    );
  }

  // Desktop header
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {showBack && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
          )}
          {currentView && onNavigate && (
            <Navigation currentView={currentView} onNavigate={onNavigate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamlinedHeader;
