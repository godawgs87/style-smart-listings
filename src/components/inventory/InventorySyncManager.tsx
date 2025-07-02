import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, RefreshCw, Upload, Download, ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEbayIntegration } from '@/hooks/useEbayIntegration';

interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
}

interface InventorySyncManagerProps {
  selectedItems: string[];
  onSyncComplete: () => void;
}

const InventorySyncManager = ({ selectedItems, onSyncComplete }: InventorySyncManagerProps) => {
  const { toast } = useToast();
  const { publishListing, syncListingStatus, publishing, syncing } = useEbayIntegration();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [syncDirection, setSyncDirection] = useState<'push' | 'pull' | 'bidirectional'>('push');
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: 'ebay', name: 'eBay', icon: '🛒', connected: true },
    { id: 'mercari', name: 'Mercari', icon: '📦', connected: false },
    { id: 'poshmark', name: 'Poshmark', icon: '👗', connected: false },
    { id: 'depop', name: 'Depop', icon: '🎨', connected: false },
  ]);

  const connectedPlatforms = platforms.filter(p => p.connected);
  const hasSelection = selectedItems.length > 0;
  const hasConnectedPlatforms = connectedPlatforms.length > 0;

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSelectAllPlatforms = () => {
    const allConnectedIds = connectedPlatforms.map(p => p.id);
    setSelectedPlatforms(
      selectedPlatforms.length === allConnectedIds.length ? [] : allConnectedIds
    );
  };

  const handleSync = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to sync with",
        variant: "destructive"
      });
      return;
    }

    if (!hasSelection) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one inventory item to sync",
        variant: "destructive"
      });
      return;
    }

    try {
      const syncOperations = [];

      for (const listingId of selectedItems) {
        for (const platformId of selectedPlatforms) {
          if (syncDirection === 'push' || syncDirection === 'bidirectional') {
            // Push to platform
            if (platformId === 'ebay') {
              syncOperations.push(publishListing(listingId));
            }
          }
          
          if (syncDirection === 'pull' || syncDirection === 'bidirectional') {
            // Pull from platform
            if (platformId === 'ebay') {
              syncOperations.push(syncListingStatus());
            }
          }
        }
      }

      await Promise.all(syncOperations);

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${selectedItems.length} items across ${selectedPlatforms.length} platforms`,
      });

      onSyncComplete();
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "There was an error syncing your inventory. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getSyncButtonText = () => {
    if (publishing || syncing) return 'Syncing...';
    
    const direction = syncDirection === 'push' ? 'Push to' : 
                     syncDirection === 'pull' ? 'Pull from' : 
                     'Sync with';
    
    const platformCount = selectedPlatforms.length;
    const itemCount = selectedItems.length;
    
    if (platformCount === 0 || itemCount === 0) {
      return 'Sync Inventory';
    }
    
    return `${direction} ${platformCount} platform${platformCount > 1 ? 's' : ''} (${itemCount} item${itemCount > 1 ? 's' : ''})`;
  };

  const getSyncIcon = () => {
    switch (syncDirection) {
      case 'push':
        return <Upload className="w-4 h-4" />;
      case 'pull':
        return <Download className="w-4 h-4" />;
      case 'bidirectional':
        return <ArrowLeftRight className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Sync Direction Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="px-3">
            {getSyncIcon()}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Sync Direction</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={syncDirection === 'push'}
            onCheckedChange={() => setSyncDirection('push')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Push to Platforms
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={syncDirection === 'pull'}
            onCheckedChange={() => setSyncDirection('pull')}
          >
            <Download className="w-4 h-4 mr-2" />
            Pull from Platforms
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={syncDirection === 'bidirectional'}
            onCheckedChange={() => setSyncDirection('bidirectional')}
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Bidirectional Sync
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Platform Selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <span className="hidden sm:inline">
              {selectedPlatforms.length === 0 
                ? 'Select Platforms' 
                : `${selectedPlatforms.length} Platform${selectedPlatforms.length > 1 ? 's' : ''}`}
            </span>
            <span className="sm:hidden">
              {selectedPlatforms.length === 0 ? 'Platforms' : selectedPlatforms.length}
            </span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <div className="flex items-center justify-between px-3 py-2">
            <DropdownMenuLabel className="p-0">Connected Platforms</DropdownMenuLabel>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllPlatforms}
              className="h-auto p-0 text-xs"
            >
              {selectedPlatforms.length === connectedPlatforms.length ? 'None' : 'All'}
            </Button>
          </div>
          <DropdownMenuSeparator />
          {connectedPlatforms.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No platforms connected
            </div>
          ) : (
            connectedPlatforms.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform.id}
                checked={selectedPlatforms.includes(platform.id)}
                onCheckedChange={() => handlePlatformToggle(platform.id)}
              >
                <span className="mr-2">{platform.icon}</span>
                {platform.name}
                <Badge variant="secondary" className="ml-auto text-xs">
                  Connected
                </Badge>
              </DropdownMenuCheckboxItem>
            ))
          )}
          {platforms.filter(p => !p.connected).length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-gray-500">
                Not Connected
              </DropdownMenuLabel>
              {platforms.filter(p => !p.connected).map((platform) => (
                <div
                  key={platform.id}
                  className="px-3 py-2 text-sm text-gray-400 flex items-center"
                >
                  <span className="mr-2">{platform.icon}</span>
                  {platform.name}
                  <Badge variant="outline" className="ml-auto text-xs">
                    Not Connected
                  </Badge>
                </div>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sync Button */}
      <Button
        onClick={handleSync}
        disabled={
          !hasConnectedPlatforms || 
          selectedPlatforms.length === 0 || 
          !hasSelection ||
          publishing ||
          syncing
        }
        size="sm"
      >
        {publishing || syncing ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          getSyncIcon()
        )}
        <span className="ml-2">{getSyncButtonText()}</span>
      </Button>

      {/* Selection Info */}
      {hasSelection && (
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {selectedItems.length} selected
        </Badge>
      )}
    </div>
  );
};

export default InventorySyncManager;