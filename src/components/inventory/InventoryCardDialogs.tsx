
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ListingEditor from '@/components/ListingEditor';
import ListingPreview from '@/components/ListingPreview';

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  };
  keywords: string[] | null;
  photos: string[] | null;
  price_research: string | null;
  shipping_cost: number | null;
}

interface InventoryCardDialogsProps {
  item: Item;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
  onSaveEdit: (updatedListing: any) => void;
}

const InventoryCardDialogs = ({
  item,
  showPreview,
  setShowPreview,
  showEditor,
  setShowEditor,
  onSaveEdit
}: InventoryCardDialogsProps) => {
  return (
    <>
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Item Preview</DialogTitle>
          </DialogHeader>
          <ListingPreview
            listing={{
              title: item.title,
              description: item.description || '',
              price: item.price,
              category: item.category || '',
              condition: item.condition || '',
              measurements: item.measurements,
              keywords: item.keywords || [],
              photos: item.photos || [],
              priceResearch: item.price_research || '',
              shippingCost: item.shipping_cost || 0
            }}
            onEdit={() => {
              setShowPreview(false);
              setShowEditor(true);
            }}
            onExport={() => {
              setShowPreview(false);
              // TODO: Handle export/publish action
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ListingEditor
            listing={{
              title: item.title,
              description: item.description || '',
              price: item.price,
              category: item.category || '',
              condition: item.condition || '',
              measurements: item.measurements,
              keywords: item.keywords || [],
              photos: item.photos || [],
              priceResearch: item.price_research || ''
            }}
            onSave={onSaveEdit}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryCardDialogs;
