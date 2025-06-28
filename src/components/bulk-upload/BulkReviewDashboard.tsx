
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid, List } from 'lucide-react';
import ReviewDashboardHeader from './components/ReviewDashboardHeader';
import ReviewDashboardItem from './components/ReviewDashboardItem';
import QuickReviewInterface from './components/QuickReviewInterface';
import type { PhotoGroup } from './BulkUploadManager';

interface BulkReviewDashboardProps {
  photoGroups: PhotoGroup[];
  onEditItem: (groupId: string) => void;
  onPreviewItem: (groupId: string) => void;
  onPostItem: (groupId: string) => void;
  onPostAll: () => void;
  onReviewAll: () => void;
  onSaveDraft: () => void;
}

const BulkReviewDashboard = ({
  photoGroups,
  onEditItem,
  onPreviewItem,
  onPostItem,
  onPostAll,
  onReviewAll,
  onSaveDraft
}: BulkReviewDashboardProps) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'quick'>('dashboard');
  const [quickReviewIndex, setQuickReviewIndex] = useState(0);

  const handleQuickReviewNext = () => {
    if (quickReviewIndex < photoGroups.length - 1) {
      setQuickReviewIndex(quickReviewIndex + 1);
    }
  };

  const handleQuickReviewBack = () => {
    if (quickReviewIndex > 0) {
      setQuickReviewIndex(quickReviewIndex - 1);
    }
  };

  const handleQuickReviewApprove = (updatedGroup: PhotoGroup) => {
    const groupIndex = photoGroups.findIndex(g => g.id === updatedGroup.id);
    if (groupIndex >= 0) {
      handleQuickReviewNext();
    }
  };

  const handleQuickReviewReject = () => {
    handleQuickReviewNext();
  };

  const handleQuickSaveDraft = (updatedGroup: PhotoGroup) => {
    // Draft saving handled by parent component
  };

  if (viewMode === 'quick') {
    return (
      <QuickReviewInterface
        groups={photoGroups}
        currentIndex={quickReviewIndex}
        onNext={handleQuickReviewNext}
        onBack={handleQuickReviewBack}
        onApprove={handleQuickReviewApprove}
        onReject={handleQuickReviewReject}
        onSaveDraft={handleQuickSaveDraft}
        onReturn={() => setViewMode('dashboard')}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <ReviewDashboardHeader
        photoGroups={photoGroups}
        onPostAll={onPostAll}
        onReviewAll={onReviewAll}
        onSaveDraft={onSaveDraft}
      />
      
      <div className="flex justify-between items-center">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && setViewMode(value as 'dashboard' | 'quick')}
        >
          <ToggleGroupItem value="dashboard">
            <Grid className="w-4 h-4 mr-2" />
            Dashboard View
          </ToggleGroupItem>
          <ToggleGroupItem value="quick">
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
          className="text-sm"
        >
          Start Quick Review
        </Button>
      </div>
      
      <div className="space-y-3 md:space-y-4">
        {photoGroups.map((group) => (
          <ReviewDashboardItem
            key={group.id}
            group={group}
            onEditItem={onEditItem}
            onPreviewItem={onPreviewItem}
            onPostItem={onPostItem}
          />
        ))}
      </div>
    </div>
  );
};

export default BulkReviewDashboard;
