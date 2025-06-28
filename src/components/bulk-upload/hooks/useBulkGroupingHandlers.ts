
import type { PhotoGroup } from '../BulkUploadManager';

type StepType = 'upload' | 'grouping' | 'processing' | 'shipping' | 'review' | 'individual-review';

export const useBulkGroupingHandlers = (
  photos: File[],
  setIsGrouping: (loading: boolean) => void,
  setCurrentStep: (step: StepType) => void,
  setPhotoGroups: (groups: PhotoGroup[] | ((prev: PhotoGroup[]) => PhotoGroup[])) => void
) => {
  const analyzePhotoSimilarity = async (photo: File): Promise<{ category: string; colors: string[]; size: string }> => {
    // Simulate AI analysis based on file name and size patterns
    const fileName = photo.name.toLowerCase();
    
    // Category detection based on common patterns
    let category = 'general';
    if (fileName.includes('shirt') || fileName.includes('top') || fileName.includes('blouse')) {
      category = 'tops';
    } else if (fileName.includes('pants') || fileName.includes('jeans') || fileName.includes('trouser')) {
      category = 'bottoms';
    } else if (fileName.includes('dress') || fileName.includes('gown')) {
      category = 'dresses';
    } else if (fileName.includes('shoe') || fileName.includes('boot') || fileName.includes('sneaker')) {
      category = 'footwear';
    } else if (fileName.includes('bag') || fileName.includes('purse') || fileName.includes('wallet')) {
      category = 'accessories';
    } else if (fileName.includes('jacket') || fileName.includes('coat') || fileName.includes('blazer')) {
      category = 'outerwear';
    }

    // Color detection simulation
    const colors = [];
    if (fileName.includes('black')) colors.push('black');
    if (fileName.includes('white')) colors.push('white');
    if (fileName.includes('red')) colors.push('red');
    if (fileName.includes('blue')) colors.push('blue');
    if (fileName.includes('green')) colors.push('green');
    if (fileName.includes('yellow')) colors.push('yellow');
    if (fileName.includes('pink')) colors.push('pink');
    if (fileName.includes('brown')) colors.push('brown');

    // Size detection
    let size = 'medium';
    if (fileName.includes('small') || fileName.includes('xs') || fileName.includes('s_')) {
      size = 'small';
    } else if (fileName.includes('large') || fileName.includes('xl') || fileName.includes('l_')) {
      size = 'large';
    }

    return { category, colors, size };
  };

  const handleStartGrouping = async () => {
    if (photos.length === 0) return;
    
    setIsGrouping(true);
    setCurrentStep('grouping');
    
    try {
      // Analyze each photo for similarity
      const photoAnalyses = await Promise.all(
        photos.map(async (photo, index) => ({
          photo,
          index,
          analysis: await analyzePhotoSimilarity(photo)
        }))
      );

      // Group photos by similarity
      const groupMap = new Map<string, typeof photoAnalyses>();
      
      photoAnalyses.forEach((item) => {
        const { category, colors, size } = item.analysis;
        
        // Create a grouping key based on category and primary characteristics
        const primaryColor = colors.length > 0 ? colors[0] : 'neutral';
        const groupKey = `${category}_${primaryColor}_${size}`;
        
        if (!groupMap.has(groupKey)) {
          groupMap.set(groupKey, []);
        }
        groupMap.get(groupKey)!.push(item);
      });

      // Convert groups to PhotoGroup format
      const groups: PhotoGroup[] = [];
      let groupIndex = 1;

      for (const [groupKey, items] of groupMap.entries()) {
        const [category, color, size] = groupKey.split('_');
        
        // Generate better group names
        let groupName = `Item ${groupIndex}`;
        if (category !== 'general') {
          groupName = category.charAt(0).toUpperCase() + category.slice(1);
          if (color !== 'neutral') {
            groupName += ` (${color})`;
          }
        }

        // Determine confidence based on grouping quality
        let confidence: 'high' | 'medium' | 'low' = 'high';
        if (items.length === 1) {
          confidence = 'medium'; // Single items are less certain
        } else if (items.length > 8) {
          confidence = 'low'; // Very large groups might be over-grouped
        }

        // Generate AI suggestion
        let aiSuggestion = `Grouped ${items.length} photos of similar ${category}`;
        if (items.length === 1) {
          aiSuggestion = 'Single item - consider if it belongs with others';
        } else if (items.length > 6) {
          aiSuggestion = 'Large group - review for accuracy';
        }

        groups.push({
          id: `group-${groupIndex}`,
          photos: items.map(item => item.photo),
          name: groupName,
          confidence,
          status: 'pending',
          aiSuggestion
        });

        groupIndex++;
      }

      // If no smart grouping worked well, fall back to smaller random groups
      if (groups.length === 1 && groups[0].photos.length > 10) {
        const fallbackGroups: PhotoGroup[] = [];
        const allPhotos = groups[0].photos;
        let currentIndex = 0;
        let fallbackGroupIndex = 1;

        while (currentIndex < allPhotos.length) {
          const groupSize = Math.min(3 + Math.floor(Math.random() * 3), allPhotos.length - currentIndex);
          const groupPhotos = allPhotos.slice(currentIndex, currentIndex + groupSize);
          
          fallbackGroups.push({
            id: `group-${fallbackGroupIndex}`,
            photos: groupPhotos,
            name: `Item ${fallbackGroupIndex}`,
            confidence: 'low',
            status: 'pending',
            aiSuggestion: `Random grouping - please review and adjust`
          });
          
          currentIndex += groupSize;
          fallbackGroupIndex++;
        }

        setPhotoGroups(fallbackGroups);
      } else {
        setPhotoGroups(groups);
      }
    } catch (error) {
      console.error('Grouping failed:', error);
      // Fallback to simple grouping
      const groups: PhotoGroup[] = [];
      let currentIndex = 0;
      
      while (currentIndex < photos.length) {
        const groupSize = Math.min(4, photos.length - currentIndex);
        const groupPhotos = photos.slice(currentIndex, currentIndex + groupSize);
        
        groups.push({
          id: `group-${groups.length + 1}`,
          photos: groupPhotos,
          name: `Item ${groups.length + 1}`,
          confidence: 'low',
          status: 'pending',
          aiSuggestion: `Basic grouping - please review`
        });
        
        currentIndex += groupSize;
      }
      
      setPhotoGroups(groups);
    } finally {
      setIsGrouping(false);
    }
  };

  const handleGroupsConfirmed = (confirmedGroups: PhotoGroup[]) => {
    setPhotoGroups(confirmedGroups);
    setCurrentStep('processing');
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed
  };
};
