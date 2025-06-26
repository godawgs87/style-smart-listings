
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ListingsManagerControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedListings: string[];
  onBulkDelete: () => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  filteredCount: number;
}

const ListingsManagerControls = ({
  searchTerm,
  setSearchTerm,
  selectedListings,
  onBulkDelete,
  viewMode,
  setViewMode,
  filteredCount
}: ListingsManagerControlsProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Input 
          type="text" 
          placeholder="Search listings..." 
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {selectedListings.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete Selected ({selectedListings.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Selected Listings</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedListings.length} listing{selectedListings.length !== 1 ? 's' : ''}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete {selectedListings.length} Listing{selectedListings.length !== 1 ? 's' : ''}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          Grid
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
        >
          Table
        </Button>
        <div className="text-sm text-gray-600">
          {filteredCount} listings
        </div>
      </div>
    </div>
  );
};

export default ListingsManagerControls;
