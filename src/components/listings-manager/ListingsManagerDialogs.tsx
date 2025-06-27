
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ListingPreview from '@/components/ListingPreview';
import ListingEditor from '@/components/ListingEditor';

interface ListingsManagerDialogsProps {
  showPreviewDialog: boolean;
  showEditDialog: boolean;
  selectedListingForDialog: any;
  onPreviewClose: () => void;
  onEditClose: () => void;
  onSaveEdit: (updatedListing: any) => void;
  onEditFromPreview: () => void;
}

const ListingsManagerDialogs = ({
  showPreviewDialog,
  showEditDialog,
  selectedListingForDialog,
  onPreviewClose,
  onEditClose,
  onSaveEdit,
  onEditFromPreview
}: ListingsManagerDialogsProps) => {
  return (
    <>
      <Dialog open={showPreviewDialog} onOpenChange={onPreviewClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Item Preview</DialogTitle>
          </DialogHeader>
          {selectedListingForDialog && (
            <ListingPreview
              listing={selectedListingForDialog}
              onEdit={onEditFromPreview}
              onExport={() => {
                onPreviewClose();
                // TODO: Handle export/publish action
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={onEditClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {selectedListingForDialog && (
            <ListingEditor
              listing={selectedListingForDialog}
              onSave={onSaveEdit}
              onCancel={onEditClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListingsManagerDialogs;
