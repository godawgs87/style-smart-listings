
import type { PhotoGroup } from '../BulkUploadManager';

export const getRandomItemSuggestion = () => {
  const suggestions = [
    'Vintage T-Shirt',
    'Blue Denim Jeans',
    'Nike Sneakers',
    'Leather Jacket',
    'Cotton Dress',
    'Baseball Cap',
    'Winter Coat',
    'Running Shoes'
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};

export const simulateAIGrouping = async (photos: File[]): Promise<PhotoGroup[]> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const groups: PhotoGroup[] = [];
  let currentIndex = 0;
  
  while (currentIndex < photos.length) {
    const groupSize = Math.min(3 + Math.floor(Math.random() * 3), photos.length - currentIndex);
    const groupPhotos = photos.slice(currentIndex, currentIndex + groupSize);
    
    groups.push({
      id: `group-${groups.length + 1}`,
      photos: groupPhotos,
      name: `Item ${groups.length + 1}`,
      confidence: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      status: 'pending',
      aiSuggestion: getRandomItemSuggestion()
    });
    
    currentIndex += groupSize;
  }
  
  return groups;
};

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
