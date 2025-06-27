
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useSimpleInventory } from './hooks/useSimpleInventory';
import SimpleInventoryControls from './SimpleInventoryControls';
import SimpleInventoryGrid from './SimpleInventoryGrid';
import SimpleInventoryStats from './SimpleInventoryStats';

interface SimpleInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

const SimpleInventoryManager = ({ onCreateListing, onBack }: SimpleInventoryManagerProps) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const { listings, loading, error, stats } = useSimpleInventory({
    searchTerm,
    statusFilter
  });

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
      <StreamlinedHeader
        title="Inventory Manager"
        showBack
        onBack={onBack}
      />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <SimpleInventoryStats stats={stats} />
        
        <SimpleInventoryControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateListing={onCreateListing}
        />

        <SimpleInventoryGrid
          listings={listings}
          loading={loading}
          error={error}
        />
      </div>

      {isMobile && (
        <MobileNavigation
          currentView="inventory"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Inventory"
        />
      )}
    </div>
  );
};

export default SimpleInventoryManager;
