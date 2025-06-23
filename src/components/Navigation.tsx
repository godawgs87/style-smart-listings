
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, List, Camera, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationProps {
  currentView?: string;
  onNavigate?: (view: 'dashboard' | 'create' | 'listings') => void;
}

const Navigation = ({ currentView, onNavigate }: NavigationProps) => {
  const { signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleNavigation = (path: string) => {
    if (path.startsWith('/')) {
      window.location.href = path;
    } else if (onNavigate) {
      onNavigate(path as 'dashboard' | 'create' | 'listings');
    }
  };

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Menu className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleNavigation('dashboard')}>
            <Camera className="w-4 h-4 mr-2" />
            Create
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation('listings')}>
            <List className="w-4 h-4 mr-2" />
            Listings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigation('/admin')}>
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        Admin
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
