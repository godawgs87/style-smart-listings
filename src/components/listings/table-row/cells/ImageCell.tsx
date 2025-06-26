
import React from 'react';
import { TableCell } from '@/components/ui/table';
import ListingImagePreview from '@/components/ListingImagePreview';

interface ImageCellProps {
  photos: string[] | null;
  title: string;
  listingId: string;
}

const ImageCell = ({ photos, title, listingId }: ImageCellProps) => {
  return (
    <TableCell className="sticky left-12 bg-white z-10 border-r">
      <ListingImagePreview 
        photos={photos} 
        title={title}
        listingId={listingId}
        className="w-12 h-12"
      />
    </TableCell>
  );
};

export default ImageCell;
