
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Trash2, Eye } from 'lucide-react';
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

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  status: string | null;
  shipping_cost: number | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  } | null;
  keywords: string[] | null;
  photos: string[] | null;
  created_at: string;
}

interface ListingsTableRowActionsProps {
  listing: Listing;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: (listingId: string) => void;
}

const ListingsTableRowActions = ({
  listing,
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onPreview,
  onDelete
}: ListingsTableRowActionsProps) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-green-50 hover:bg-green-100 border-green-200"
          onClick={onSave}
        >
          <Save className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-gray-50 hover:bg-gray-100"
          onClick={onCancel}
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 bg-blue-50 hover:bg-blue-100 border-blue-200"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 bg-gray-50 hover:bg-gray-100"
        onClick={onPreview}
      >
        <Eye className="h-4 w-4 text-gray-600" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{listing.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(listing.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListingsTableRowActions;
