
import React, { useState, useCallback } from 'react';
import { Image } from 'lucide-react';
import { imageService } from '@/services/imageService';

interface ListingImagePreviewProps {
  photos?: string[] | null;
  title: string;
  listingId?: string;
  className?: string;
}

const ListingImagePreview = React.memo(({ photos, title, listingId, className = "w-12 h-12" }: ListingImagePreviewProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get display image immediately without database calls
  const displayImage = listingId ? imageService.getDisplayImage(listingId, photos) : null;
  const hasActualPhotos = imageService.hasPhotos(photos);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    console.warn('📸 Image load error for listing:', listingId);
    setIsLoading(false);
    setImageError(true);
  }, [listingId]);

  const handleImageLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  // Show loading state only when actually loading an image
  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error state or fallback
  if (imageError || !displayImage) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <Image className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden bg-gray-100 flex-shrink-0`}>
      <img
        src={displayImage}
        alt={title}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        onLoadStart={handleImageLoadStart}
        loading="lazy"
      />
      {!hasActualPhotos && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <span className="text-white text-xs font-medium">SAMPLE</span>
        </div>
      )}
    </div>
  );
});

ListingImagePreview.displayName = 'ListingImagePreview';

export default ListingImagePreview;
