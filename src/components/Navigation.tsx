
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  PlusCircle, 
  BarChart3, 
  Settings,
  List
} from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/create-listing', icon: PlusCircle, label: 'Create' },
    { path: '/listings', icon: List, label: 'Listings' },
    { path: '/active-listings', icon: BarChart3, label: 'Active' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map(({ path, icon: Icon, label }) => (
        <Button
          key={path}
          variant={location.pathname === path ? "default" : "ghost"}
          size="sm"
          onClick={() => handleNavigation(path)}
          className="flex items-center space-x-2"
        >
          <Icon className="w-4 h-4" />
          <span className="hidden lg:inline">{label}</span>
        </Button>
      ))}
    </nav>
  );
};

export default Navigation;
