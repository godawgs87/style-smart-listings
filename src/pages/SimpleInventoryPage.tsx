
import React from 'react';
import InventoryManager from '@/components/inventory/InventoryManager';

const SimpleInventoryPage = () => {
  const handleCreateListing = () => {
    window.location.href = '/?view=create';
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <InventoryManager
      onCreateListing={handleCreateListing}
      onBack={handleBack}
    />
  );
};

export default SimpleInventoryPage;
