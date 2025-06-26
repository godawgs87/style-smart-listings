import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import PhotoUpload from '@/components/PhotoUpload';
import ShippingCalculator from '@/components/ShippingCalculator';

interface CreateListingContentProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

interface Measurements {
  length: string;
  width: string;
  height: string;
  weight: string;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  status: string;
  photos: string[];
  shipping_cost: string;
  measurements: Measurements;
  keywords: string[];
  purchase_price: string;
  purchase_date: string;
  is_consignment: boolean;
  consignment_percentage: string;
  consignor_name: string;
  consignor_contact: string;
  source_type: string;
  source_location: string;
  cost_basis: string;
  fees_paid: string;
  net_profit: string;
  profit_margin: string;
  listed_date: string;
  sold_date: string;
  sold_price: string;
  days_to_sell: string;
  performance_notes: string;
}

const CreateListingContent = ({ onSave, onCancel, initialData }: CreateListingContentProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    category: initialData?.category || '',
    condition: initialData?.condition || '',
    status: initialData?.status || 'draft',
    photos: initialData?.photos || [],
    shipping_cost: initialData?.shipping_cost?.toString() || '',
    measurements: initialData?.measurements || {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    keywords: initialData?.keywords || [],
    purchase_price: initialData?.purchase_price?.toString() || '',
    purchase_date: initialData?.purchase_date || '',
    is_consignment: initialData?.is_consignment || false,
    consignment_percentage: initialData?.consignment_percentage?.toString() || '',
    consignor_name: initialData?.consignor_name || '',
    consignor_contact: initialData?.consignor_contact || '',
    source_type: initialData?.source_type || '',
    source_location: initialData?.source_location || '',
    cost_basis: initialData?.cost_basis?.toString() || '',
    fees_paid: initialData?.fees_paid?.toString() || '',
    net_profit: initialData?.net_profit?.toString() || '',
    profit_margin: initialData?.profit_margin?.toString() || '',
    listed_date: initialData?.listed_date || '',
    sold_date: initialData?.sold_date || '',
    sold_price: initialData?.sold_price?.toString() || '',
    days_to_sell: initialData?.days_to_sell?.toString() || '',
    performance_notes: initialData?.performance_notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMeasurementsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [name]: value,
      },
    }));
  };

  const handlePhotoUpload = (photos: string[]) => {
    setFormData(prev => ({ ...prev, photos }));
  };

  const handleConsignmentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_consignment: checked }));
  };

  const handleShippingSelect = (shippingOption: any) => {
    setFormData(prev => ({ ...prev, shipping_cost: shippingOption.cost.toString() }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select condition" defaultValue={formData.condition} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="like new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" defaultValue={formData.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload onUpload={handlePhotoUpload} initialPhotos={formData.photos} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Measurements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Length (in)</Label>
              <Input
                type="number"
                id="length"
                name="length"
                value={formData.measurements.length}
                onChange={handleMeasurementsChange}
              />
            </div>
            <div>
              <Label htmlFor="width">Width (in)</Label>
              <Input
                type="number"
                id="width"
                name="width"
                value={formData.measurements.width}
                onChange={handleMeasurementsChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (in)</Label>
              <Input
                type="number"
                id="height"
                name="height"
                value={formData.measurements.height}
                onChange={handleMeasurementsChange}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                type="number"
                id="weight"
                name="weight"
                value={formData.measurements.weight}
                onChange={handleMeasurementsChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping</CardTitle>
        </CardHeader>
        <CardContent>
          <ShippingCalculator
            itemWeight={formData.measurements?.weight ? parseFloat(formData.measurements.weight) : 1}
            itemDimensions={{
              length: formData.measurements?.length ? parseInt(formData.measurements.length) : 12,
              width: formData.measurements?.width ? parseInt(formData.measurements.width) : 12,
              height: formData.measurements?.height ? parseInt(formData.measurements.height) : 6
            }}
            onShippingSelect={handleShippingSelect}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                type="number"
                id="purchase_price"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                type="date"
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_consignment"
              checked={formData.is_consignment}
              onCheckedChange={handleConsignmentChange}
            />
            <Label htmlFor="is_consignment">Is Consignment</Label>
          </div>
          {formData.is_consignment && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consignment_percentage">Consignment Percentage</Label>
                  <Input
                    type="number"
                    id="consignment_percentage"
                    name="consignment_percentage"
                    value={formData.consignment_percentage}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="consignor_name">Consignor Name</Label>
                  <Input
                    type="text"
                    id="consignor_name"
                    name="consignor_name"
                    value={formData.consignor_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="consignor_contact">Consignor Contact</Label>
                <Input
                  type="text"
                  id="consignor_contact"
                  name="consignor_contact"
                  value={formData.consignor_contact}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sourcing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source_type">Source Type</Label>
              <Input
                type="text"
                id="source_type"
                name="source_type"
                value={formData.source_type}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="source_location">Source Location</Label>
              <Input
                type="text"
                id="source_location"
                name="source_location"
                value={formData.source_location}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost_basis">Cost Basis</Label>
              <Input
                type="number"
                id="cost_basis"
                name="cost_basis"
                value={formData.cost_basis}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="fees_paid">Fees Paid</Label>
              <Input
                type="number"
                id="fees_paid"
                name="fees_paid"
                value={formData.fees_paid}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="net_profit">Net Profit</Label>
              <Input
                type="number"
                id="net_profit"
                name="net_profit"
                value={formData.net_profit}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="profit_margin">Profit Margin</Label>
              <Input
                type="number"
                id="profit_margin"
                name="profit_margin"
                value={formData.profit_margin}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="listed_date">Listed Date</Label>
              <Input
                type="date"
                id="listed_date"
                name="listed_date"
                value={formData.listed_date}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="sold_date">Sold Date</Label>
              <Input
                type="date"
                id="sold_date"
                name="sold_date"
                value={formData.sold_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="sold_price">Sold Price</Label>
            <Input
              type="number"
              id="sold_price"
              name="sold_price"
              value={formData.sold_price}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="days_to_sell">Days to Sell</Label>
            <Input
              type="number"
              id="days_to_sell"
              name="days_to_sell"
              value={formData.days_to_sell}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="performance_notes">Performance Notes</Label>
            <Textarea
              id="performance_notes"
              name="performance_notes"
              value={formData.performance_notes}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
};

export default CreateListingContent;
