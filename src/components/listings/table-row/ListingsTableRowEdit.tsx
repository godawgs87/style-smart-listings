
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  condition: string | null;
  status: string | null;
  shipping_cost: number | null;
  measurements: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
  } | null;
  keywords: string[] | null;
  photos: string[] | null;
  created_at: string;
}

interface ListingsTableRowEditProps {
  editData: Partial<Listing>;
  updateEditData: (field: keyof Listing, value: any) => void;
  updateMeasurements: (field: string, value: string) => void;
  updateKeywords: (keywords: string) => void;
}

const ListingsTableRowEdit = ({
  editData,
  updateEditData,
  updateMeasurements,
  updateKeywords
}: ListingsTableRowEditProps) => {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const statuses = ['draft', 'active', 'sold', 'archived'];

  return {
    title: (
      <Input
        value={editData.title || ''}
        onChange={(e) => updateEditData('title', e.target.value)}
        placeholder="Title"
        className="font-medium"
      />
    ),
    price: (
      <Input
        type="number"
        value={editData.price || 0}
        onChange={(e) => updateEditData('price', parseFloat(e.target.value) || 0)}
        placeholder="Price"
        step="0.01"
        className="w-full"
      />
    ),
    status: (
      <Select
        value={editData.status || ''}
        onValueChange={(value) => updateEditData('status', value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map(status => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    category: (
      <Select
        value={editData.category || ''}
        onValueChange={(value) => updateEditData('category', value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    condition: (
      <Select
        value={editData.condition || ''}
        onValueChange={(value) => updateEditData('condition', value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Condition" />
        </SelectTrigger>
        <SelectContent>
          {conditions.map(cond => (
            <SelectItem key={cond} value={cond}>{cond}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    shipping: (
      <Input
        type="number"
        value={editData.shipping_cost || 9.95}
        onChange={(e) => updateEditData('shipping_cost', parseFloat(e.target.value) || 9.95)}
        placeholder="Shipping"
        step="0.01"
        className="w-full"
      />
    ),
    measurements: (
      <div className="space-y-1">
        <Input
          placeholder="L x W x H"
          value={`${editData.measurements?.length || ''} x ${editData.measurements?.width || ''} x ${editData.measurements?.height || ''}`}
          onChange={(e) => {
            const parts = e.target.value.split('x').map(p => p.trim());
            updateMeasurements('length', parts[0] || '');
            updateMeasurements('width', parts[1] || '');
            updateMeasurements('height', parts[2] || '');
          }}
          className="text-xs"
        />
      </div>
    ),
    keywords: (
      <Textarea
        placeholder="keyword1, keyword2, keyword3"
        value={editData.keywords?.join(', ') || ''}
        onChange={(e) => updateKeywords(e.target.value)}
        className="text-xs min-h-[60px]"
      />
    ),
    description: (
      <Textarea
        placeholder="Description..."
        value={editData.description || ''}
        onChange={(e) => updateEditData('description', e.target.value)}
        className="text-xs min-h-[80px]"
      />
    )
  };
};

export default ListingsTableRowEdit;
