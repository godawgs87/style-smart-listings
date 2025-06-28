import type { PhotoGroup } from '../BulkUploadManager';

// Keep only the shipping option generation since that's still needed
export const generateListingData = (group: PhotoGroup) => {
  return {
    title: group.name,
    category: 'Clothing',
    condition: 'Used',
    price: Math.floor(Math.random() * 50) + 10,
    photos: group.photos.map(photo => URL.createObjectURL(photo)),
    measurements: {
      weight: Math.random() > 0.5 ? '6oz' : '1.2lb',
      length: Math.floor(Math.random() * 10) + 20 + '"',
      width: Math.floor(Math.random() * 8) + 15 + '"'
    }
  };
};
