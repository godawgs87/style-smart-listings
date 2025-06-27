
// Centralized image service for managing placeholder images and optimized loading
export class ImageService {
  private static instance: ImageService;
  private placeholderUrls: string[] = [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop'
  ];
  
  private imageCache = new Map<string, string>();
  
  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }
  
  // Get a consistent placeholder for a listing ID
  getPlaceholderForListing(listingId: string): string {
    if (this.imageCache.has(listingId)) {
      return this.imageCache.get(listingId)!;
    }
    
    // Use listing ID to consistently assign same placeholder
    const hash = this.simpleHash(listingId);
    const placeholderUrl = this.placeholderUrls[hash % this.placeholderUrls.length];
    
    this.imageCache.set(listingId, placeholderUrl);
    return placeholderUrl;
  }
  
  // Check if listing has actual photos (without loading them)
  hasPhotos(photos: string[] | null): boolean {
    return photos && photos.length > 0;
  }
  
  // Get first photo or placeholder
  getDisplayImage(listingId: string, photos: string[] | null): string {
    if (this.hasPhotos(photos)) {
      return photos![0];
    }
    return this.getPlaceholderForListing(listingId);
  }
  
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export const imageService = ImageService.getInstance();
