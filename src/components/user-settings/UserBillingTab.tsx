
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Download, Calendar } from 'lucide-react';

const UserBillingTab = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <CreditCard className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Subscription & Billing</h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium">Current Plan</h4>
              <p className="text-sm text-gray-600">Manage your subscription</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Pro Plan</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold">$29</p>
              <p className="text-sm text-gray-600">per month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold">1,250</p>
              <p className="text-sm text-gray-600">listings used</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold">750</p>
              <p className="text-sm text-gray-600">remaining</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">Cancel Subscription</Button>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-lg font-medium mb-3">Payment Method</h4>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-xs font-bold">
                ••••
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/26</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium">Billing History</h4>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>

          <div className="space-y-2">
            {[
              { date: 'Dec 1, 2024', amount: '$29.00', status: 'Paid', invoice: 'INV-001' },
              { date: 'Nov 1, 2024', amount: '$29.00', status: 'Paid', invoice: 'INV-002' },
              { date: 'Oct 1, 2024', amount: '$29.00', status: 'Paid', invoice: 'INV-003' },
            ].map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{bill.date}</p>
                    <p className="text-sm text-gray-600">{bill.invoice}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">{bill.status}</Badge>
                  <p className="font-medium">{bill.amount}</p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-lg font-medium mb-3">Billing Address</h4>
          <div className="p-3 border rounded-lg">
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-gray-600">123 Main Street</p>
            <p className="text-sm text-gray-600">Anytown, ST 12345</p>
            <p className="text-sm text-gray-600">United States</p>
          </div>
          <Button variant="outline" className="mt-2">Edit Address</Button>
        </div>
      </div>
    </Card>
  );
};

export default UserBillingTab;
