
import React, { useEffect, useState } from 'react';
import { Image } from 'lucide-react';
import { useListingPhotos } from '@/hooks/listing-data/photos/useListingPhotos';

interface ListingImagePreviewProps {
  photos?: string[] | null;
  title: string;
  listingId?: string; // Add listing ID for on-demand loading
}

const ListingImagePreview = ({ photos, title, listingId }: ListingImagePreviewProps) => {
  const [displayPhoto, setDisplayPhoto] = useState<string | null>(null);
  const { loadPhotos, isLoadingPhotos, getFirstPhoto } = useListingPhotos();

  useEffect(() => {
    // If photos are already provided, use the first one
    if (photos && photos.length > 0) {
      setDisplayPhoto(photos[0]);
      return;
    }

    // If no photos but we have a listing ID, load photos on-demand
    if (listingId && !isLoadingPhotos(listingId)) {
      loadPhotos(listingId).then(loadedPhotos => {
        if (loadedPhotos && loadedPhotos.length > 0) {
          setDisplayPhoto(loadedPhotos[0]);
        }
      });
    }
  }, [photos, listingId, loadPhotos, isLoadingPhotos]);

  if (!displayPhoto) {
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <Image className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
      <img
        src={displayPhoto}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          `;
        }}
      />
    </div>
  );
};

export default ListingImagePreview;
