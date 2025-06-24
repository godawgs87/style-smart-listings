
import { ListingData } from '@/types/CreateListing';

export const validateListingData = (data: ListingData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!data.price || data.price <= 0) {
    errors.push('Valid price is required');
  }
  
  if (!data.photos || data.photos.length === 0) {
    errors.push('At least one photo is required');
  }
  
  // Data type validation
  if (data.title && typeof data.title !== 'string') {
    errors.push('Title must be text');
  }
  
  if (data.price && (typeof data.price !== 'number' || isNaN(data.price))) {
    errors.push('Price must be a valid number');
  }
  
  // Optional field validation
  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be text');
  }
  
  if (data.category && typeof data.category !== 'string') {
    errors.push('Category must be text');
  }
  
  if (data.condition && typeof data.condition !== 'string') {
    errors.push('Condition must be text');
  }
  
  if (data.keywords && !Array.isArray(data.keywords)) {
    errors.push('Keywords must be an array');
  }
  
  if (data.photos && !Array.isArray(data.photos)) {
    errors.push('Photos must be an array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeListingData = (data: ListingData): ListingData => {
  return {
    ...data,
    title: data.title?.trim() || '',
    description: data.description?.trim() || '',
    category: data.category?.trim() || '',
    condition: data.condition?.trim() || '',
    price: Number(data.price) || 0,
    measurements: data.measurements || {},
    keywords: Array.isArray(data.keywords) ? data.keywords.filter(k => k && k.trim()) : [],
    photos: Array.isArray(data.photos) ? data.photos.filter(p => p && p.trim()) : []
  };
};
