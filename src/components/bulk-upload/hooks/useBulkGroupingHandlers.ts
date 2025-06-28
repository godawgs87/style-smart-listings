
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
    console.log('=== GROUPING FUNCTION CALLED ===');
    console.log('Photos received:', photos);
    console.log('Photos length:', photos.length);
    
    if (photos.length === 0) {
      console.log('❌ No photos to group - returning early');
      return;
    }
    
    console.log('✅ Starting grouping process...');
    
    setIsGrouping(true);
    setCurrentStep('grouping');
    
    try {
      console.log('📝 Creating groups...');
      
      // Create simple groups - each photo gets its own group for now to test
      const groups: PhotoGroup[] = [];
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        console.log(`Creating group ${i + 1} for photo:`, photo.name);
        
        const newGroup: PhotoGroup = {
          id: `group-${i + 1}`,
          photos: [photo],
          name: `Item ${i + 1}`,
          confidence: 'high',
          status: 'pending',
          aiSuggestion: `Single item: ${photo.name}`
        };
        
        groups.push(newGroup);
        console.log(`✅ Created group ${i + 1}:`, newGroup);
      }

      console.log('🎉 ALL GROUPS CREATED:');
      console.log('Total groups:', groups.length);
      console.log('Groups array:', groups);
      
      console.log('🔧 Setting photo groups...');
      setPhotoGroups(groups);
      console.log('✅ Photo groups set successfully');
      
    } catch (error) {
      console.error('❌ Grouping failed with error:', error);
      
      // Create fallback single groups
      const fallbackGroups: PhotoGroup[] = photos.map((photo, index) => ({
        id: `fallback-group-${index + 1}`,
        photos: [photo],
        name: `Item ${index + 1}`,
        confidence: 'medium',
        status: 'pending',
        aiSuggestion: `Fallback group for ${photo.name}`
      }));
      
      console.log('🔄 Created fallback groups:', fallbackGroups.length);
      setPhotoGroups(fallbackGroups);
    } finally {
      console.log('🏁 Grouping process finished');
      setIsGrouping(false);
    }
  };

  const handleGroupsConfirmed = (confirmedGroups: PhotoGroup[]) => {
    console.log('✅ Groups confirmed by user:', confirmedGroups.length, 'groups');
    setPhotoGroups(confirmedGroups);
    setCurrentStep('processing');
  };

  return {
    handleStartGrouping,
    handleGroupsConfirmed
  };
};
