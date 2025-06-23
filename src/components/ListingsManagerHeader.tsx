
import React from 'react';
import MobileHeader from '@/components/MobileHeader';
import Navigation from '@/components/Navigation';

interface ListingsManagerHeaderProps {
  userEmail?: string;
  onBack: () => void;
}

const ListingsManagerHeader = ({ userEmail, onBack }: ListingsManagerHeaderProps) => {
  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Listings</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
            <Navigation />
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader 
          title="Manage Listings" 
          showBack 
          onBack={onBack}
        />
      </div>
    </>
  );
};

export default ListingsManagerHeader;
