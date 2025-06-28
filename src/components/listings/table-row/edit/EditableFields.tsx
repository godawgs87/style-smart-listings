
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CategorySelector from '@/components/CategorySelector';

interface EditableFieldsProps {
  editData: {
    title: string;
    price: number;
    category: string;
    category_id?: string | null;
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
        className="w-full mb-2"
        placeholder="Title"
      />
      
      <Input
        type="number"
        step="0.01"
        value={editData.price}
        onChange={(e) => onUpdate('price', parseFloat(e.target.value) || 0)}
        className="w-24 mb-2"
        placeholder="Price"
      />

      <Select value={editData.status} onValueChange={(value) => onUpdate('status', value)}>
        <SelectTrigger className="w-24 mb-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="sold">Sold</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <div className="mb-2">
        <CategorySelector
          value={editData.category_id || null}
          onChange={(categoryId) => onUpdate('category_id', categoryId)}
          placeholder="Select category"
          className="w-48"
        />
      </div>

      <Select value={editData.condition} onValueChange={(value) => onUpdate('condition', value)}>
        <SelectTrigger className="w-24 mb-2">
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
        placeholder="Shipping"
      />
    </>
  );
};

export default EditableFields;
