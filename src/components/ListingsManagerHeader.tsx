
import React from 'react';
import StreamlinedHeader from '@/components/StreamlinedHeader';

interface ListingsManagerHeaderProps {
  userEmail?: string;
  onBack: () => void;
}

const ListingsManagerHeader = ({ userEmail, onBack }: ListingsManagerHeaderProps) => {
  return (
    <StreamlinedHeader
      title="Manage Listings"
      userEmail={userEmail}
      showBack
      onBack={onBack}
    />
  );
};

export default ListingsManagerHeader;
