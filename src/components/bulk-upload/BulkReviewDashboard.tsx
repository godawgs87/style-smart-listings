
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EnhancedPreviewDialog from './components/EnhancedPreviewDialog';
import AIDetailsTableView from './components/AIDetailsTableView';
import type { PhotoGroup } from './BulkUploadManager';

interface BulkReviewDashboardProps {
  photoGroups: PhotoGroup[];
  onEditItem: (groupId: string) => void;
  onPreviewItem: (groupId: string) => void;
  onPostItem: (groupId: string) => void;
  onPostAll: () => void;
  onUpdateGroup?: (updatedGroup: PhotoGroup) => void;
  onRetryAnalysis?: (groupId: string) => void;
  isAnalyzing?: boolean;
}

const BulkReviewDashboard = ({
  photoGroups,
  onEditItem,
  onPreviewItem,
  onPostItem,
  onPostAll,
  onUpdateGroup,
  onRetryAnalysis,
  isAnalyzing
}: BulkReviewDashboardProps) => {
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

  const handleRunAI = (groupId: string) => {
    if (onRetryAnalysis) {
      onRetryAnalysis(groupId);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🤖 AI Analysis Queue ({photoGroups.length} items)</h2>
        {isAnalyzing && (
          <div className="text-blue-600 font-medium">
            AI Analysis in progress...
          </div>
        )}
      </div>
      
      <AIDetailsTableView
        photoGroups={photoGroups}
        onEditItem={onEditItem}
        onPreviewItem={handlePreviewClick}
        onPostItem={onPostItem}
        onRunAI={handleRunAI}
        isAnalyzing={isAnalyzing}
      />

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
