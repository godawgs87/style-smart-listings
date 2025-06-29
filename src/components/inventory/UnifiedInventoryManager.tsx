
import React from 'react';
import OptimizedInventoryManager from './OptimizedInventoryManager';

interface UnifiedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

// Use only the OptimizedInventoryManager to avoid any conflicts
const UnifiedInventoryManager = ({ onCreateListing, onBack }: UnifiedInventoryManagerProps) => {
  return (
    <OptimizedInventoryManager
      onCreateListing={onCreateListing}
      onBack={onBack}
    />
  );
};

export default UnifiedInventoryManager;
