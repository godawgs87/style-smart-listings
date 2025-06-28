
import React, { useState, useCallback } from 'react';
import { Image } from 'lucide-react';

interface ListingImagePreviewProps {
  photos?: string[] | null;
  title: string;
  listingId?: string;
  className?: string;
}

const ListingImagePreview = React.memo(({ photos, title, className = "w-12 h-12" }: ListingImagePreviewProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log('📸 ListingImagePreview - Photos received:', photos, 'for title:', title);

  // Check if we have actual uploaded photos - be more lenient with the check
  const hasActualPhotos = Array.isArray(photos) && photos.length > 0 && photos.some(photo => photo && photo.trim() !== '');
  const firstPhoto = hasActualPhotos ? photos.find(photo => photo && photo.trim() !== '') : null;
  
  console.log('📸 Has actual photos:', hasActualPhotos, 'First photo:', firstPhoto);

  const handleImageLoad = useCallback(() => {
    console.log('📸 Image loaded successfully');
    setIsLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    console.warn('📸 Image load error for image:', firstPhoto);
    setIsLoading(false);
    setImageError(true);
  }, [firstPhoto]);

  const handleImageLoadStart = useCallback(() => {
    console.log('📸 Image loading started');
    setIsLoading(true);
  }, []);

  // Show loading state only when actually loading an image
  if (isLoading && hasActualPhotos) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error state or no image fallback
  if (imageError || !hasActualPhotos || !firstPhoto) {
    console.log('📸 Showing fallback - Error:', imageError, 'Has photos:', hasActualPhotos, 'First photo:', firstPhoto);
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <Image className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  console.log('📸 Rendering image:', firstPhoto);
  return (
    <div className={`${className} rounded-lg overflow-hidden bg-gray-100 flex-shrink-0`}>
      <img
        src={firstPhoto}
        alt={title}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        onLoadStart={handleImageLoadStart}
        loading="lazy"
      />
    </div>
  );
});

ListingImagePreview.displayName = 'ListingImagePreview';

export default ListingImagePreview;
