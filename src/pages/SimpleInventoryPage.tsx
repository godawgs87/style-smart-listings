
import React from 'react';
import SimpleInventoryManager from '@/components/inventory-v2/SimpleInventoryManager';

const SimpleInventoryPage = () => {
  const handleCreateListing = () => {
    window.location.href = '/';
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <SimpleInventoryManager
      onCreateListing={handleCreateListing}
      onBack={handleBack}
    />
  );
};

export default SimpleInventoryPage;
