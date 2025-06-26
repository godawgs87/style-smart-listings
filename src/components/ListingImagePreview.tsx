
import React from 'react';
import { Image } from 'lucide-react';

interface ListingImagePreviewProps {
  photos?: string[] | null;
  title: string;
}

const ListingImagePreview = ({ photos, title }: ListingImagePreviewProps) => {
  const firstPhoto = photos && photos.length > 0 ? photos[0] : null;

  if (!firstPhoto) {
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <Image className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
      <img
        src={firstPhoto}
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
