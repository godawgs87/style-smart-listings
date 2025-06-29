
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Download, FileText } from 'lucide-react';

const UserFinancialsTab = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <DollarSign className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Financial Management</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Payment Methods</Label>
          <p className="text-sm text-gray-600 mb-3">Manage how you receive payments</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  PP
                </div>
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-gray-600">user@email.com</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  BANK
                </div>
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-gray-600">••••••••1234</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            
            <Button variant="outline" className="w-full">
              + Add Payment Method
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Tax Information</Label>
          <p className="text-sm text-gray-600 mb-3">Tax reporting and documentation</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax-id">Tax ID / EIN</Label>
              <Input id="tax-id" placeholder="XX-XXXXXXX" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="business-name">Business Name</Label>
              <Input id="business-name" placeholder="Your business name" className="mt-1" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download Tax Summary (2024)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate 1099 Forms
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Fee Tracking</Label>
          <p className="text-sm text-gray-600 mb-3">Monitor platform fees and costs</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">$1,245</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">$156</p>
              <p className="text-sm text-gray-600">Platform Fees</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">$89</p>
              <p className="text-sm text-gray-600">Shipping</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">$1,000</p>
              <p className="text-sm text-gray-600">Net Profit</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Reports & Exports</Label>
          <p className="text-sm text-gray-600 mb-3">Download financial reports and statements</p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Profit & Loss Statement
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Sales Report (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Fee Analysis Report
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserFinancialsTab;
