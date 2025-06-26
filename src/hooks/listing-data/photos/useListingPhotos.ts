
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useListingPhotos = () => {
  const [loadingPhotos, setLoadingPhotos] = useState<Set<string>>(new Set());
  const [photosCache, setPhotosCache] = useState<Map<string, string[]>>(new Map());

  const loadPhotos = useCallback(async (listingId: string): Promise<string[]> => {
    // Return cached photos if available
    if (photosCache.has(listingId)) {
      console.log('📸 Returning cached photos for:', listingId);
      return photosCache.get(listingId) || [];
    }

    // Skip if already loading
    if (loadingPhotos.has(listingId)) {
      console.log('⏳ Photos already loading for:', listingId);
      return [];
    }

    setLoadingPhotos(prev => new Set(prev).add(listingId));

    try {
      console.log('📸 Loading photos for:', listingId);
      const { data, error } = await supabase
        .from('listings')
        .select('photos')
        .eq('id', listingId)
        .single();

      if (error) {
        console.error('❌ Failed to load photos for:', listingId, error);
        return [];
      }

      const photos = Array.isArray(data?.photos) ? data.photos : [];
      setPhotosCache(prev => new Map(prev).set(listingId, photos));
      console.log('✅ Loaded and cached photos for:', listingId, photos.length, 'photos');
      return photos;
    } catch (error) {
      console.error('💥 Exception loading photos:', error);
      return [];
    } finally {
      setLoadingPhotos(prev => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }
  }, [photosCache, loadingPhotos]);

  const isLoadingPhotos = useCallback((listingId: string) => {
    return loadingPhotos.has(listingId);
  }, [loadingPhotos]);

  const hasPhotos = useCallback((listingId: string) => {
    return photosCache.has(listingId);
  }, [photosCache]);

  const getFirstPhoto = useCallback((listingId: string): string | null => {
    const photos = photosCache.get(listingId);
    return photos && photos.length > 0 ? photos[0] : null;
  }, [photosCache]);

  return {
    loadPhotos,
    isLoadingPhotos,
    hasPhotos,
    getFirstPhoto
  };
};
