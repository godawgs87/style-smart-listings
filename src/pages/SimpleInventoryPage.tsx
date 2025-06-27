
import React from 'react';
import UnifiedInventoryManager from '@/components/inventory/UnifiedInventoryManager';

const SimpleInventoryPage = () => {
  const handleCreateListing = () => {
    window.location.href = '/';
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <UnifiedInventoryManager
      onCreateListing={handleCreateListing}
      onBack={handleBack}
    />
  );
};

export default SimpleInventoryPage;
