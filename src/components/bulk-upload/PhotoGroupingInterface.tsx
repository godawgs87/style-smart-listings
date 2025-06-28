
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Plus, Merge, Split, Grid3X3 } from 'lucide-react';
import type { PhotoGroup } from './BulkUploadManager';

interface PhotoGroupingInterfaceProps {
  photoGroups: PhotoGroup[];
  onGroupsConfirmed: (groups: PhotoGroup[]) => void;
  onBack: () => void;
}

const PhotoGroupingInterface = ({ photoGroups, onGroupsConfirmed, onBack }: PhotoGroupingInterfaceProps) => {
  const [groups, setGroups] = useState<PhotoGroup[]>(photoGroups);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  const getConfidenceIcon = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getConfidenceText = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'High Confidence';
      case 'medium': return 'Review Suggested';
      case 'low': return 'Needs Review';
    }
  };

  const handleGroupNameChange = (groupId: string, newName: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, name: newName } : group
    ));
  };

  const createNewGroup = () => {
    const newGroup: PhotoGroup = {
      id: `group-${Date.now()}`,
      photos: [],
      name: `New Group ${groups.length + 1}`,
      confidence: 'high',
      status: 'pending'
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const mergeSelectedGroups = () => {
    if (selectedGroups.size < 2) return;
    
    const groupsToMerge = groups.filter(g => selectedGroups.has(g.id));
    const mergedPhotos = groupsToMerge.flatMap(g => g.photos);
    const firstGroup = groupsToMerge[0];
    
    const mergedGroup: PhotoGroup = {
      ...firstGroup,
      photos: mergedPhotos,
      name: `Merged ${firstGroup.name}`,
      confidence: 'medium'
    };
    
    const remainingGroups = groups.filter(g => !selectedGroups.has(g.id));
    setGroups([...remainingGroups, mergedGroup]);
    setSelectedGroups(new Set());
  };

  const splitGroup = (groupId: string) => {
    const groupToSplit = groups.find(g => g.id === groupId);
    if (!groupToSplit || groupToSplit.photos.length < 2) return;
    
    const midPoint = Math.ceil(groupToSplit.photos.length / 2);
    const firstHalf = groupToSplit.photos.slice(0, midPoint);
    const secondHalf = groupToSplit.photos.slice(midPoint);
    
    const newGroup1: PhotoGroup = {
      ...groupToSplit,
      photos: firstHalf,
      name: `${groupToSplit.name} (1)`
    };
    
    const newGroup2: PhotoGroup = {
      ...groupToSplit,
      id: `${groupToSplit.id}-split`,
      photos: secondHalf,
      name: `${groupToSplit.name} (2)`
    };
    
    setGroups(prev => prev.filter(g => g.id !== groupId).concat([newGroup1, newGroup2]));
  };

  const deleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getHighConfidenceCount = () => groups.filter(g => g.confidence === 'high').length;
  const getNeedsReviewCount = () => groups.filter(g => g.confidence !== 'high').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Review AI Grouping
            </div>
            <div className="flex gap-2 text-sm">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {getHighConfidenceCount()} Groups Ready
              </Badge>
              {getNeedsReviewCount() > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {getNeedsReviewCount()} Need Review
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" onClick={createNewGroup}>
              <Plus className="w-4 h-4 mr-2" />
              New Group
            </Button>
            <Button 
              variant="outline" 
              onClick={mergeSelectedGroups}
              disabled={selectedGroups.size < 2}
            >
              <Merge className="w-4 h-4 mr-2" />
              Merge Selected ({selectedGroups.size})
            </Button>
            <Button variant="outline" onClick={() => setSelectedGroups(new Set())}>
              Clear Selection
            </Button>
          </div>

          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.id} className={`${selectedGroups.has(group.id) ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.id)}
                        onChange={() => handleGroupSelection(group.id)}
                        className="rounded"
                      />
                      <Input
                        value={group.name}
                        onChange={(e) => handleGroupNameChange(group.id, e.target.value)}
                        className="font-semibold bg-transparent border-none p-0 h-auto"
                      />
                      {getConfidenceIcon(group.confidence)}
                      <Badge variant="outline" className="text-xs">
                        {getConfidenceText(group.confidence)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => splitGroup(group.id)}
                        disabled={group.photos.length < 2}
                      >
                        <Split className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGroup(group.id)}
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {group.aiSuggestion && (
                    <p className="text-sm text-gray-600">AI suggests: {group.aiSuggestion}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {group.photos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`${group.name} photo ${photoIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {group.photos.length} photos
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              Back to Upload
            </Button>
            <Button 
              onClick={() => onGroupsConfirmed(groups)}
              className="bg-green-600 hover:bg-green-700"
            >
              Process All Groups ({groups.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoGroupingInterface;
