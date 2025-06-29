
import React from 'react';
import OptimizedInventoryManager from '@/components/inventory/OptimizedInventoryManager';

const SimpleInventoryPage = () => {
  const handleCreateListing = () => {
    window.location.href = '/';
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <OptimizedInventoryManager
      onCreateListing={handleCreateListing}
      onBack={handleBack}
    />
  );
};

export default SimpleInventoryPage;
