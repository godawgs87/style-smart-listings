
import React from 'react';
import OptimizedInventoryManager from './OptimizedInventoryManager';

interface UnifiedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

// Simplified to just use the OptimizedInventoryManager to avoid conflicts
const UnifiedInventoryManager = ({ onCreateListing, onBack }: UnifiedInventoryManagerProps) => {
  return (
    <OptimizedInventoryManager
      onCreateListing={onCreateListing}
      onBack={onBack}
    />
  );
};

export default UnifiedInventoryManager;
