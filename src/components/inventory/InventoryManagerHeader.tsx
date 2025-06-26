
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import StreamlinedHeader from '@/components/StreamlinedHeader';
import MobileNavigation from '@/components/MobileNavigation';

interface InventoryManagerHeaderProps {
  userEmail?: string;
  onBack: () => void;
}

const InventoryManagerHeader = ({ userEmail, onBack }: InventoryManagerHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      <StreamlinedHeader
        title="Inventory Manager"
        userEmail={userEmail}
        showBack
        onBack={onBack}
      />
      
      {isMobile && (
        <MobileNavigation
          currentView="inventory"
          onNavigate={() => {}}
          showBack
          onBack={onBack}
          title="Inventory"
        />
      )}
    </>
  );
};

export default InventoryManagerHeader;
