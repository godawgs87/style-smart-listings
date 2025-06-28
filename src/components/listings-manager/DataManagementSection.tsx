
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, ChevronDown, ChevronUp } from 'lucide-react';
import CSVDataManager from '@/components/inventory/CSVDataManager';
import type { Listing } from '@/types/Listing';

interface DataManagementSectionProps {
  listings: Listing[];
  onDataUpdate: () => void;
}

const DataManagementSection = ({ listings, onDataUpdate }: DataManagementSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true); // Changed to true so it's visible by default

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export, import, and manage your inventory data
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <CSVDataManager 
            listings={listings} 
            onImportComplete={onDataUpdate}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default DataManagementSection;
