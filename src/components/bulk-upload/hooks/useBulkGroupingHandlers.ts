
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
      console.log('Starting grouping with', photos.length, 'photos');
      
      // Analyze each photo for similarity
      const photoAnalyses = await Promise.all(
        photos.map(async (photo, index) => ({
          photo,
          index,
          analysis: await analyzePhotoSimilarity(photo)
        }))
      );

      console.log('Photo analyses completed:', photoAnalyses);

      // Create simple groups - group by 3-4 photos each
      const groups: PhotoGroup[] = [];
      let currentIndex = 0;
      let groupIndex = 1;

      while (currentIndex < photos.length) {
        const groupSize = Math.min(4, photos.length - currentIndex);
        const groupPhotos = photos.slice(currentIndex, currentIndex + groupSize);
        
        // Try to find common characteristics for naming
        const groupAnalyses = photoAnalyses.slice(currentIndex, currentIndex + groupSize);
        const categories = groupAnalyses.map(item => item.analysis.category);
        const colors = groupAnalyses.flatMap(item => item.analysis.colors);
        
        // Generate group name based on most common category or color
        let groupName = `Item ${groupIndex}`;
        const categoryCount = categories.reduce((acc, cat) => {
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonCategory = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)[0]?.[0];
        
        if (mostCommonCategory && mostCommonCategory !== 'general') {
          groupName = mostCommonCategory.charAt(0).toUpperCase() + mostCommonCategory.slice(1);
          
          // Add color if there's a common one
          const colorCount = colors.reduce((acc, color) => {
            acc[color] = (acc[color] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const mostCommonColor = Object.entries(colorCount)
            .sort(([,a], [,b]) => b - a)[0]?.[0];
          
          if (mostCommonColor && colorCount[mostCommonColor] > 1) {
            groupName += ` (${mostCommonColor})`;
          }
        }

        // Determine confidence
        let confidence: 'high' | 'medium' | 'low' = 'medium';
        if (groupSize === 1) {
          confidence = 'high'; // Single items are good
        } else if (mostCommonCategory && mostCommonCategory !== 'general') {
          confidence = 'high'; // Items with matching categories
        } else {
          confidence = 'low'; // Mixed items
        }

        // Generate AI suggestion
        let aiSuggestion = `Group of ${groupSize} item${groupSize > 1 ? 's' : ''}`;
        if (mostCommonCategory && mostCommonCategory !== 'general') {
          aiSuggestion = `${groupSize} ${mostCommonCategory} item${groupSize > 1 ? 's' : ''} grouped together`;
        } else if (groupSize === 1) {
          aiSuggestion = 'Single item ready for processing';
        } else {
          aiSuggestion = 'Mixed items - review and split if needed';
        }

        groups.push({
          id: `group-${groupIndex}`,
          photos: groupPhotos,
          name: groupName,
          confidence,
          status: 'pending',
          aiSuggestion
        });

        currentIndex += groupSize;
        groupIndex++;
      }

      console.log('Created groups:', groups);
      setPhotoGroups(groups);
    } catch (error) {
      console.error('Grouping failed:', error);
      
      // Simple fallback: create groups of 3-4 photos each
      const groups: PhotoGroup[] = [];
      let currentIndex = 0;
      
      while (currentIndex < photos.length) {
        const groupSize = Math.min(3, photos.length - currentIndex);
        const groupPhotos = photos.slice(currentIndex, currentIndex + groupSize);
        
        groups.push({
          id: `group-${groups.length + 1}`,
          photos: groupPhotos,
          name: `Item ${groups.length + 1}`,
          confidence: 'medium',
          status: 'pending',
          aiSuggestion: `Group of ${groupSize} item${groupSize > 1 ? 's' : ''}`
        });
        
        currentIndex += groupSize;
      }
      
      console.log('Fallback groups created:', groups);
      setPhotoGroups(groups);
    } finally {
      setIsGrouping(false);
    }
  };

  const handleGroupsConfirmed = (confirmedGroups: PhotoGroup[]) => {
    console.log('Groups confirmed:', confirmedGroups);
    setPhotoGroups(confirmedGroups);
    setCurrentStep('processing');
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed
  };
};
