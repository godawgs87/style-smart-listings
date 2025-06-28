
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditableFieldsProps {
  editData: {
    title: string;
    price: number;
    category: string;
    condition: string;
    status: string;
    shipping_cost: number;
    purchase_price: number;
    source_type: string;
    source_location: string;
  };
  onUpdate: (field: string, value: any) => void;
}

const EditableFields = ({ editData, onUpdate }: EditableFieldsProps) => {
  return (
    <>
      <Input
        value={editData.title}
        onChange={(e) => onUpdate('title', e.target.value)}
        className="w-full"
      />
      
      <Input
        type="number"
        step="0.01"
        value={editData.price}
        onChange={(e) => onUpdate('price', parseFloat(e.target.value) || 0)}
        className="w-24"
      />

      <Select value={editData.status} onValueChange={(value) => onUpdate('status', value)}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="sold">Sold</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={editData.category}
        onChange={(e) => onUpdate('category', e.target.value)}
        className="w-32"
        placeholder="Category"
      />

      <Select value={editData.condition} onValueChange={(value) => onUpdate('condition', value)}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="New">New</SelectItem>
          <SelectItem value="Like New">Like New</SelectItem>
          <SelectItem value="Used">Used</SelectItem>
          <SelectItem value="Fair">Fair</SelectItem>
          <SelectItem value="Poor">Poor</SelectItem>
          <SelectItem value="For Parts">For Parts</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        step="0.01"
        value={editData.shipping_cost}
        onChange={(e) => onUpdate('shipping_cost', parseFloat(e.target.value) || 0)}
        className="w-24"
      />
    </>
  );
};

export default EditableFields;
