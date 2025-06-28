
import React from 'react';
import ReviewDashboardHeader from './components/ReviewDashboardHeader';
import ReviewDashboardItem from './components/ReviewDashboardItem';
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
  console.log('📊 BulkReviewDashboard render with groups:', photoGroups);

  const handleEditItem = (groupId: string) => {
    console.log('🔧 BulkReviewDashboard - Edit item clicked:', groupId);
    onEditItem(groupId);
  };

  const handlePreviewItem = (groupId: string) => {
    console.log('👁️ BulkReviewDashboard - Preview item clicked:', groupId);
    onPreviewItem(groupId);
  };

  const handlePostItem = (groupId: string) => {
    console.log('📤 BulkReviewDashboard - Post item clicked:', groupId);
    onPostItem(groupId);
  };

  const handlePostAll = () => {
    console.log('📤📤 BulkReviewDashboard - Post all clicked');
    onPostAll();
  };

  const handleReviewAll = () => {
    console.log('👁️👁️ BulkReviewDashboard - Review all clicked');
    onReviewAll();
  };

  const handleSaveDraft = () => {
    console.log('💾 BulkReviewDashboard - Save draft clicked');
    onSaveDraft();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <ReviewDashboardHeader
        photoGroups={photoGroups}
        onPostAll={handlePostAll}
        onReviewAll={handleReviewAll}
        onSaveDraft={handleSaveDraft}
      />
      
      <div className="space-y-3 md:space-y-4">
        {photoGroups.map((group) => (
          <ReviewDashboardItem
            key={group.id}
            group={group}
            onEditItem={handleEditItem}
            onPreviewItem={handlePreviewItem}
            onPostItem={handlePostItem}
          />
        ))}
      </div>
    </div>
  );
};

export default BulkReviewDashboard;
