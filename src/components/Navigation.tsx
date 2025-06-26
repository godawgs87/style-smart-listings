
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, List, Camera, LogOut, Menu, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NavigationProps {
  currentView?: string;
  onNavigate?: (view: 'dashboard' | 'create' | 'listings' | 'inventory') => void;
}

const Navigation = ({ currentView, onNavigate }: NavigationProps) => {
  const { signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleNavigation = (path: string) => {
    if (path.startsWith('/')) {
      window.location.href = path;
    } else if (onNavigate) {
      onNavigate(path as 'dashboard' | 'create' | 'listings' | 'inventory');
    } else {
      // If no onNavigate handler, navigate to home and use URL params or state
      window.location.href = `/?view=${path}`;
    }
  };

  if (isMobile) {
    return (
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <Menu className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
            <DropdownMenuItem onClick={() => handleNavigation('dashboard')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <Camera className="w-4 h-4 mr-2" />
              Create
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('inventory')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('listings')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <List className="w-4 h-4 mr-2" />
              Listings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation('/admin')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <nav className="flex items-center space-x-2">
      <Button
        variant={currentView === 'dashboard' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleNavigation('dashboard')}
        className="hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Camera className="w-4 h-4 mr-2" />
        Create
      </Button>

      <Button
        variant={currentView === 'inventory' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleNavigation('inventory')}
        className="hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Package className="w-4 h-4 mr-2" />
        Inventory
      </Button>
      
      <Button
        variant={currentView === 'listings' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleNavigation('listings')}
        className="hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <List className="w-4 h-4 mr-2" />
        Listings
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleNavigation('/admin')}
        className="hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        className="hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </nav>
  );
};

export default Navigation;
