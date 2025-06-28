
import React from 'react';
import { Button } from '@/components/ui/button';
import PageInfoDialog from '@/components/PageInfoDialog';

interface ListingsManagerHeaderProps {
  usingFallback: boolean;
  onRefetch: () => void;
}

const ListingsManagerHeader = ({ usingFallback, onRefetch }: ListingsManagerHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold">Manage Listings</h1>
      <PageInfoDialog pageName="Manage Listings" />
      {usingFallback && (
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            Offline Mode
          </div>
          <Button
            onClick={onRefetch}
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Reconnect
          </Button>
        </div>
      )}
    </div>
  );
};

export default ListingsManagerHeader;
