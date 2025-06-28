
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  exportListingsToCSV, 
  downloadCSV, 
  parseCSV, 
  validateCSVRow, 
  convertCSVRowToListing,
  type CSVImportRow 
} from '@/utils/csvUtils';
import type { Listing } from '@/types/Listing';

interface CSVDataManagerProps {
  listings: Listing[];
  onImportComplete: () => void;
}

const CSVDataManager = ({ listings, onImportComplete }: CSVDataManagerProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = exportListingsToCSV(listings);
      const filename = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      
      toast({
        title: "Export Successful",
        description: `Exported ${listings.length} listings to ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportErrors([]);
    setImportSuccess(null);
    setImportProgress(0);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      // Validate all rows first
      const allErrors: string[] = [];
      const validRows: CSVImportRow[] = [];
      
      rows.forEach((row, index) => {
        const validation = validateCSVRow(row, index);
        if (validation.isValid) {
          validRows.push(row);
        } else {
          allErrors.push(...validation.errors);
        }
      });

      if (allErrors.length > 0) {
        setImportErrors(allErrors);
        setIsImporting(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Import valid rows in batches
      let successCount = 0;
      const batchSize = 10;
      
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        const listingsToInsert = batch.map(row => {
          const listing = convertCSVRowToListing(row);
          return {
            user_id: user.id,
            title: listing.title || 'Untitled',
            price: listing.price || 0,
            description: listing.description,
            category: listing.category,
            condition: listing.condition,
            status: listing.status || 'draft',
            purchase_price: listing.purchase_price,
            purchase_date: listing.purchase_date,
            cost_basis: listing.cost_basis,
            net_profit: listing.net_profit,
            profit_margin: listing.profit_margin,
            shipping_cost: listing.shipping_cost,
            is_consignment: listing.is_consignment || false,
            consignment_percentage: listing.consignment_percentage,
            consignor_name: listing.consignor_name,
            consignor_contact: listing.consignor_contact,
            source_type: listing.source_type,
            source_location: listing.source_location,
            listed_date: listing.listed_date,
            sold_date: listing.sold_date,
            sold_price: listing.sold_price,
            days_to_sell: listing.days_to_sell,
            performance_notes: listing.performance_notes,
            keywords: listing.keywords,
            photos: listing.photos,
            measurements: listing.measurements,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });

        const { error } = await supabase
          .from('listings')
          .insert(listingsToInsert);

        if (error) {
          console.error('Batch import error:', error);
          allErrors.push(`Failed to import batch starting at row ${i + 1}: ${error.message}`);
        } else {
          successCount += batch.length;
        }

        setImportProgress(Math.round(((i + batch.length) / validRows.length) * 100));
      }

      if (successCount > 0) {
        setImportSuccess(`Successfully imported ${successCount} listings`);
        onImportComplete();
        toast({
          title: "Import Successful",
          description: `Imported ${successCount} listings`,
        });
      }

      if (allErrors.length > 0) {
        setImportErrors(allErrors);
      }

    } catch (error) {
      console.error('Import error:', error);
      setImportErrors([`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const templateHeaders = [
      'Title',
      'Description',
      'Price',
      'Category',
      'Condition',
      'Status',
      'Purchase Price',
      'Purchase Date',
      'Cost Basis',
      'Shipping Cost',
      'Is Consignment',
      'Consignment Percentage',
      'Consignor Name',
      'Consignor Contact',
      'Source Type',
      'Source Location',
      'Keywords',
      'Measurements Length',
      'Measurements Width',
      'Measurements Height',
      'Measurements Weight'
    ];
    
    const templateRow = [
      'Sample Item Title',
      'Sample description',
      '25.00',
      'Electronics',
      'Good',
      'draft',
      '15.00',
      '2024-01-01',
      '18.00',
      '9.95',
      'false',
      '',
      '',
      '',
      'Thrift Store',
      'Local Store',
      'electronics;vintage;tested',
      '10',
      '8',
      '2',
      '1.5'
    ];

    const csvContent = [templateHeaders.join(','), templateRow.join(',')].join('\n');
    downloadCSV(csvContent, 'inventory_import_template.csv');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your inventory as a CSV file for backup or analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || listings.length === 0}
            className="w-full sm:w-auto"
          >
            {isExporting ? 'Exporting...' : `Export ${listings.length} Listings`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Upload a CSV file to bulk import listings into your inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="w-full sm:w-auto"
            >
              Download Template
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full sm:w-auto"
            >
              {isImporting ? 'Importing...' : 'Choose CSV File'}
            </Button>
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Importing listings...</div>
              <Progress value={importProgress} className="w-full" />
              <div className="text-xs text-gray-500">{importProgress}% complete</div>
            </div>
          )}

          {importSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{importSuccess}</AlertDescription>
            </Alert>
          )}

          {importErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Import Errors:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {importErrors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {importErrors.length > 10 && (
                    <li className="text-gray-500">... and {importErrors.length - 10} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVDataManager;
