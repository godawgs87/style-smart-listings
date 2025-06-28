
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid, List } from 'lucide-react';
import ReviewDashboardHeader from './components/ReviewDashboardHeader';
import ImprovedReviewDashboardItem from './components/ImprovedReviewDashboardItem';
import QuickReviewInterface from './components/QuickReviewInterface';
import EnhancedPreviewDialog from './components/EnhancedPreviewDialog';
import GroupingActions from './components/GroupingActions';
import type { PhotoGroup } from './BulkUploadManager';

interface BulkReviewDashboardProps {
  photoGroups: PhotoGroup[];
  onEditItem: (groupId: string) => void;
  onPreviewItem: (groupId: string) => void;
  onPostItem: (groupId: string) => void;
  onPostAll: () => void;
  onReviewAll: () => void;
  onSaveDraft: () => void;
  onUpdateGroup?: (updatedGroup: PhotoGroup) => void;
  onRetryAnalysis?: (groupId: string) => void;
}

const BulkReviewDashboard = ({
  photoGroups,
  onEditItem,
  onPreviewItem,
  onPostItem,
  onPostAll,
  onReviewAll,
  onSaveDraft,
  onUpdateGroup,
  onRetryAnalysis
}: BulkReviewDashboardProps) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'quick'>('dashboard');
  const [quickReviewIndex, setQuickReviewIndex] = useState(0);
  const [previewGroup, setPreviewGroup] = useState<PhotoGroup | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreviewClick = (groupId: string) => {
    const group = photoGroups.find(g => g.id === groupId);
    if (group) {
      setPreviewGroup(group);
      setIsPreviewOpen(true);
    }
  };

  const handlePreviewSave = (updatedGroup: PhotoGroup) => {
    if (onUpdateGroup) {
      onUpdateGroup(updatedGroup);
    }
    setIsPreviewOpen(false);
  };

  const handleMergeGroups = (groupIds: string[]) => {
    if (groupIds.length < 2 || !onUpdateGroup) return;
    
    console.log('Merging groups:', groupIds);
    
    // Find all groups to merge
    const groupsToMerge = photoGroups.filter(g => groupIds.includes(g.id));
    if (groupsToMerge.length < 2) return;
    
    // Create merged group using the first group as base
    const baseGroup = groupsToMerge[0];
    const allPhotos = groupsToMerge.flatMap(g => g.photos);
    
    const mergedGroup: PhotoGroup = {
      ...baseGroup,
      photos: allPhotos,
      name: `${baseGroup.name.replace(' (1 photo)', '')} (${allPhotos.length} photos)`,
      confidence: 'medium' as const,
      status: 'pending' as const,
      aiSuggestion: `Merged from ${groupsToMerge.length} groups`
    };
    
    console.log('Created merged group:', mergedGroup);
    
    // Update the first group to be the merged group and remove the others
    onUpdateGroup(mergedGroup);
    
    // Note: We can't actually remove groups from the parent state here
    // This would need to be implemented in the parent component
    // For now, we just update the first group with merged data
  };

  const handleSplitGroup = (groupId: string) => {
    console.log('Split group requested for:', groupId);
    // This would split a group back into individual photos
    // Implementation would depend on parent component support
  };

  const handleReviewGrouping = () => {
    console.log('Review grouping requested');
    onReviewAll();
  };

  if (viewMode === 'quick') {
    return (
      <QuickReviewInterface
        groups={photoGroups}
        currentIndex={quickReviewIndex}
        onNext={() => {
          if (quickReviewIndex < photoGroups.length - 1) {
            setQuickReviewIndex(quickReviewIndex + 1);
          }
        }}
        onBack={() => {
          if (quickReviewIndex > 0) {
            setQuickReviewIndex(quickReviewIndex - 1);
          }
        }}
        onApprove={(updatedGroup: PhotoGroup) => {
          if (onUpdateGroup) {
            onUpdateGroup(updatedGroup);
          }
          if (quickReviewIndex < photoGroups.length - 1) {
            setQuickReviewIndex(quickReviewIndex + 1);
          }
        }}
        onReject={() => {
          if (quickReviewIndex < photoGroups.length - 1) {
            setQuickReviewIndex(quickReviewIndex + 1);
          }
        }}
        onSaveDraft={(updatedGroup: PhotoGroup) => {
          if (onUpdateGroup) {
            onUpdateGroup(updatedGroup);
          }
        }}
        onReturn={() => setViewMode('dashboard')}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <ReviewDashboardHeader
        photoGroups={photoGroups}
        onPostAll={onPostAll}
        onSaveDraft={onSaveDraft}
        onReviewAll={onReviewAll}
      />
      
      {/* Show GroupingActions prominently at the top */}
      <GroupingActions
        groups={photoGroups}
        onMergeGroups={handleMergeGroups}
        onSplitGroup={handleSplitGroup}
        onReviewGrouping={handleReviewGrouping}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && setViewMode(value as 'dashboard' | 'quick')}
          className="w-full sm:w-auto"
        >
          <ToggleGroupItem value="dashboard" className="flex-1 sm:flex-none">
            <Grid className="w-4 h-4 mr-2" />
            Dashboard
          </ToggleGroupItem>
          <ToggleGroupItem value="quick" className="flex-1 sm:flex-none">
            <List className="w-4 h-4 mr-2" />
            Quick Review
          </ToggleGroupItem>
        </ToggleGroup>
        
        <Button 
          variant="outline" 
          onClick={() => {
            setViewMode('quick');
            setQuickReviewIndex(0);
          }}
          className="w-full sm:w-auto"
        >
          Start Quick Review
        </Button>
      </div>
      
      <div className="space-y-4">
        {photoGroups.map((group) => (
          <ImprovedReviewDashboardItem
            key={group.id}
            group={group}
            onEditItem={onEditItem}
            onPreviewItem={handlePreviewClick}
            onPostItem={onPostItem}
            onRetryAnalysis={onRetryAnalysis}
          />
        ))}
      </div>

      <EnhancedPreviewDialog
        group={previewGroup}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSave={handlePreviewSave}
      />
    </div>
  );
};

export default BulkReviewDashboard;
