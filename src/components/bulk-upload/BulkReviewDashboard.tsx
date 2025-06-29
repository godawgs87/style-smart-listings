
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid, Table } from 'lucide-react';
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
}

const BulkReviewDashboard = ({
  photoGroups,
  onEditItem,
  onPreviewItem,
  onPostItem,
  onPostAll,
  onUpdateGroup,
  onRetryAnalysis
}: BulkReviewDashboardProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'dashboard'>('table');
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

  if (viewMode === 'table') {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">🤖 AI Analysis Queue ({photoGroups.length} items)</h2>
          <Button 
            variant="outline" 
            onClick={() => setViewMode('dashboard')}
          >
            Dashboard View
          </Button>
        </div>
        
        <AIDetailsTableView
          photoGroups={photoGroups}
          onEditItem={onEditItem}
          onPreviewItem={handlePreviewClick}
          onPostItem={onPostItem}
          onRunAI={handleRunAI}
        />

        <EnhancedPreviewDialog
          group={previewGroup}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onSave={handlePreviewSave}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bulk Review Dashboard</h2>
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && setViewMode(value as 'table' | 'dashboard')}
        >
          <ToggleGroupItem value="table">
            <Table className="w-4 h-4 mr-2" />
            AI Queue
          </ToggleGroupItem>
          <ToggleGroupItem value="dashboard">
            <Grid className="w-4 h-4 mr-2" />
            Dashboard
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="text-center py-8">
        <p className="text-gray-600">Dashboard view - simplified bulk review interface</p>
        <Button 
          onClick={() => setViewMode('table')}
          className="mt-4"
        >
          Switch to AI Queue
        </Button>
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
