
import React, { useEffect, useState } from 'react';
import { Image } from 'lucide-react';
import { useListingPhotos } from '@/hooks/listing-data/photos/useListingPhotos';

interface ListingImagePreviewProps {
  photos?: string[] | null;
  title: string;
  listingId?: string;
  className?: string;
}

const ListingImagePreview = ({ photos, title, listingId, className = "w-12 h-12" }: ListingImagePreviewProps) => {
  const [displayPhoto, setDisplayPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { loadPhotos, isLoadingPhotos } = useListingPhotos();

  useEffect(() => {
    console.log('📸 ListingImagePreview useEffect - photos:', photos?.length, 'listingId:', listingId);
    
    // If photos are already provided, use the first one
    if (photos && photos.length > 0) {
      console.log('📸 Using provided photos, first photo:', photos[0]);
      setDisplayPhoto(photos[0]);
      return;
    }

    // If no photos but we have a listing ID, load photos on-demand
    if (listingId && !isLoadingPhotos(listingId)) {
      console.log('📸 Loading photos on-demand for listing:', listingId);
      setIsLoading(true);
      
      loadPhotos(listingId).then(loadedPhotos => {
        console.log('📸 Loaded photos for', listingId, ':', loadedPhotos?.length, 'photos');
        if (loadedPhotos && loadedPhotos.length > 0) {
          setDisplayPhoto(loadedPhotos[0]);
        }
        setIsLoading(false);
      }).catch(error => {
        console.error('📸 Error loading photos:', error);
        setIsLoading(false);
      });
    }
  }, [photos, listingId, loadPhotos, isLoadingPhotos]);

  if (isLoading || isLoadingPhotos(listingId || '')) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!displayPhoto) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <Image className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden bg-gray-100 flex-shrink-0`}>
      <img
        src={displayPhoto}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('📸 Image load error for:', displayPhoto);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          `;
        }}
      />
    </div>
  );
};

export default ListingImagePreview;
