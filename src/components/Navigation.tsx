
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, List, Camera, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  currentView?: string;
  onNavigate?: (view: 'dashboard' | 'create' | 'listings') => void;
}

const Navigation = ({ currentView, onNavigate }: NavigationProps) => {
  const { signOut } = useAuth();

  const handleNavigation = (path: string) => {
    if (path.startsWith('/')) {
      window.location.href = path;
    } else if (onNavigate) {
      onNavigate(path as 'dashboard' | 'create' | 'listings');
    }
  };

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
