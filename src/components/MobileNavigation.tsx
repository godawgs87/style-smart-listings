
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, List, Settings, ArrowLeft, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileNavigationProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'create' | 'listings' | 'inventory') => void;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

const MobileNavigation = ({ 
  currentView, 
  onNavigate, 
  showBack = false, 
  onBack,
  title 
}: MobileNavigationProps) => {
  const { signOut } = useAuth();

  const handleAdminClick = () => {
    window.location.href = '/admin';
  };

  if (showBack && onBack) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAdminClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 z-50">
      <div className="flex justify-around items-center py-2">
        <Button
          variant={currentView === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center p-3 min-h-16"
        >
          <Camera className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </Button>
        
        <Button
          variant={currentView === 'create' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onNavigate('create')}
          className="flex flex-col items-center p-3 min-h-16"
        >
          <Camera className="w-5 h-5 mb-1" />
          <span className="text-xs">Create</span>
        </Button>

        <Button
          variant={currentView === 'inventory' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onNavigate('inventory')}
          className="flex flex-col items-center p-3 min-h-16"
        >
          <Package className="w-5 h-5 mb-1" />
          <span className="text-xs">Inventory</span>
        </Button>
        
        <Button
          variant={currentView === 'listings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onNavigate('listings')}
          className="flex flex-col items-center p-3 min-h-16"
        >
          <List className="w-5 h-5 mb-1" />
          <span className="text-xs">Listings</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAdminClick}
          className="flex flex-col items-center p-3 min-h-16"
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileNavigation;
