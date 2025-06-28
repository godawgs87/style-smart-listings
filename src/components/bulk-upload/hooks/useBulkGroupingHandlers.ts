
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
    if (photos.length === 0) {
      console.log('No photos to group');
      return;
    }
    
    console.log('=== GROUPING START ===');
    console.log('Starting grouping with', photos.length, 'photos');
    
    setIsGrouping(true);
    setCurrentStep('grouping');
    
    try {
      // Create groups of 3-4 photos each with better logic
      const groups: PhotoGroup[] = [];
      let currentIndex = 0;
      let groupIndex = 1;

      // Analyze photos first
      const photoAnalyses = await Promise.all(
        photos.map(async (photo, index) => ({
          photo,
          index,
          analysis: await analyzePhotoSimilarity(photo)
        }))
      );

      console.log('Photo analyses completed:', photoAnalyses.length, 'photos analyzed');

      while (currentIndex < photos.length) {
        const groupSize = Math.min(3, photos.length - currentIndex);
        const groupPhotos = photos.slice(currentIndex, currentIndex + groupSize);
        
        console.log(`Creating group ${groupIndex} with ${groupSize} photos`);
        
        // Try to find common characteristics for naming
        const groupAnalyses = photoAnalyses.slice(currentIndex, currentIndex + groupSize);
        const categories = groupAnalyses.map(item => item.analysis.category);
        
        // Generate group name based on most common category
        let groupName = `Item ${groupIndex}`;
        const categoryCount = categories.reduce((acc, cat) => {
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonCategory = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)[0]?.[0];
        
        if (mostCommonCategory && mostCommonCategory !== 'general') {
          groupName = mostCommonCategory.charAt(0).toUpperCase() + mostCommonCategory.slice(1);
        }

        // Determine confidence - make it more realistic
        let confidence: 'high' | 'medium' | 'low' = 'high';
        if (groupSize === 1) {
          confidence = 'high'; // Single items are always high confidence
        } else if (mostCommonCategory && mostCommonCategory !== 'general') {
          confidence = 'high'; // Items with matching categories
        } else {
          confidence = 'medium'; // Mixed items get medium confidence
        }

        // Generate AI suggestion
        let aiSuggestion = `Single item ready for processing`;
        if (groupSize > 1) {
          if (mostCommonCategory && mostCommonCategory !== 'general') {
            aiSuggestion = `${groupSize} ${mostCommonCategory} items grouped together - good match!`;
          } else {
            aiSuggestion = `${groupSize} mixed items - consider splitting if they're very different`;
          }
        }

        const newGroup: PhotoGroup = {
          id: `group-${groupIndex}`,
          photos: groupPhotos,
          name: groupName,
          confidence,
          status: 'pending',
          aiSuggestion
        };

        groups.push(newGroup);
        console.log(`Group ${groupIndex} created:`, newGroup);

        currentIndex += groupSize;
        groupIndex++;
      }

      console.log('=== GROUPING COMPLETE ===');
      console.log('Total groups created:', groups.length);
      console.log('Groups:', groups);
      
      // Set the groups - this should trigger the UI update
      setPhotoGroups(groups);
      
    } catch (error) {
      console.error('Grouping failed:', error);
      
      // Fallback: create simple groups
      const fallbackGroups: PhotoGroup[] = [];
      let currentIndex = 0;
      
      while (currentIndex < photos.length) {
        const groupSize = Math.min(3, photos.length - currentIndex);
        const groupPhotos = photos.slice(currentIndex, currentIndex + groupSize);
        
        fallbackGroups.push({
          id: `group-${fallbackGroups.length + 1}`,
          photos: groupPhotos,
          name: `Item ${fallbackGroups.length + 1}`,
          confidence: 'medium',
          status: 'pending',
          aiSuggestion: `Group of ${groupSize} item${groupSize > 1 ? 's' : ''}`
        });
        
        currentIndex += groupSize;
      }
      
      console.log('Fallback groups created:', fallbackGroups.length);
      setPhotoGroups(fallbackGroups);
    } finally {
      setIsGrouping(false);
    }
  };

  const handleGroupsConfirmed = (confirmedGroups: PhotoGroup[]) => {
    console.log('Groups confirmed:', confirmedGroups.length, 'groups');
    setPhotoGroups(confirmedGroups);
    setCurrentStep('processing');
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed
  };
};
