
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleInventoryManager from '@/components/inventory-v2/SimpleInventoryManager';

const SimpleInventoryPage = () => {
  const navigate = useNavigate();

  const handleCreateListing = () => {
    navigate('/create-listing');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <SimpleInventoryManager
      onCreateListing={handleCreateListing}
      onBack={handleBack}
    />
  );
};

export default SimpleInventoryPage;
