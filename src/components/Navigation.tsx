
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, List, Camera, LogOut, Menu, Package, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/components/ThemeProvider';
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
  const { theme, toggleTheme } = useTheme();

  const handleNavigation = (path: string) => {
    if (path.startsWith('/')) {
      window.location.href = path;
    } else if (onNavigate) {
      onNavigate(path as 'dashboard' | 'create' | 'listings' | 'inventory');
    }
  };

  if (isMobile) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <DropdownMenuItem onClick={() => handleNavigation('dashboard')} className="cursor-pointer">
              <Camera className="w-4 h-4 mr-2" />
              Create
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('inventory')} className="cursor-pointer">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('listings')} className="cursor-pointer">
              <List className="w-4 h-4 mr-2" />
              Listings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation('/admin')} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
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
      >
        <Camera className="w-4 h-4 mr-2" />
        Create
      </Button>

      <Button
        variant={currentView === 'inventory' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleNavigation('inventory')}
      >
        <Package className="w-4 h-4 mr-2" />
        Inventory
      </Button>
      
      <Button
        variant={currentView === 'listings' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleNavigation('listings')}
      >
        <List className="w-4 h-4 mr-2" />
        Listings
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleNavigation('/admin')}
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
      >
        {theme === 'light' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
        Theme
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </nav>
  );
};

export default Navigation;
