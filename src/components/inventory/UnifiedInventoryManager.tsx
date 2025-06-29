
import React from 'react';
import OptimizedInventoryManager from './OptimizedInventoryManager';

interface UnifiedInventoryManagerProps {
  onCreateListing: () => void;
  onBack: () => void;
}

// Simple wrapper that uses the OptimizedInventoryManager with stable hooks
const UnifiedInventoryManager = ({ onCreateListing, onBack }: UnifiedInventoryManagerProps) => {
  return (
    <OptimizedInventoryManager
      onCreateListing={onCreateListing}
      onBack={onBack}
    />
  );
};

export default UnifiedInventoryManager;
