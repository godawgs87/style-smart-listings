import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import type { Listing } from '@/types/Listing';

interface EditableCellProps {
  field: keyof Listing;
  value: any;
  isEditing: boolean;
  onUpdate: (field: keyof Listing, value: any) => void;
  className?: string;
}

const EditableTableCell = ({ field, value, isEditing, onUpdate, className }: EditableCellProps) => {
  const { categories } = useCategories();
  
  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'active': return 'default';
      case 'sold': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const renderCategoryOptions = () => {
    const options: JSX.Element[] = [];
    
    const renderCategoryGroup = (cats: any[], level = 0) => {
      cats.forEach(cat => {
        const indent = '  '.repeat(level);
        options.push(
          <SelectItem key={cat.id} value={cat.name}>
            {indent}{cat.name}
          </SelectItem>
        );
        if (cat.children && cat.children.length > 0) {
          renderCategoryGroup(cat.children, level + 1);
        }
      });
    };
    
    renderCategoryGroup(categories);
    return options;
  };

  const renderEditableContent = () => {
    switch (field) {
      case 'title':
        return isEditing ? (
          <Input
            value={value || ''}
            onChange={(e) => onUpdate(field, e.target.value)}
            className="w-full"
          />
        ) : (
          <>
            <div className="truncate font-medium">{value}</div>
            <div className="text-xs text-gray-500 truncate">
              {/* Created date would be passed separately if needed */}
            </div>
          </>
        );

      case 'price':
        return isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={value || 0}
            onChange={(e) => onUpdate(field, parseFloat(e.target.value) || 0)}
            className="w-full"
          />
        ) : (
          <span className="font-semibold text-green-600">
            ${value?.toFixed(2)}
          </span>
        );

      case 'status':
        return isEditing ? (
          <Select value={value || 'draft'} onValueChange={(newValue) => onUpdate(field, newValue)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          value && (
            <Badge variant={getStatusBadgeVariant(value)}>
              {value}
            </Badge>
          )
        );

      case 'category':
        return isEditing ? (
          <Select value={value || ''} onValueChange={(newValue) => onUpdate(field, newValue)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50 max-h-60 overflow-y-auto">
              {renderCategoryOptions()}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm">{value || '-'}</span>
        );

      case 'condition':
        return isEditing ? (
          <Select value={value || ''} onValueChange={(newValue) => onUpdate(field, newValue)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Like New">Like New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
              <SelectItem value="For Parts">For Parts</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm">{value || '-'}</span>
        );

      case 'shipping_cost':
        return isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={value || 0}
            onChange={(e) => onUpdate(field, parseFloat(e.target.value) || 0)}
            className="w-full"
          />
        ) : (
          <span className="text-sm">
            {value ? `$${value.toFixed(2)}` : '-'}
          </span>
        );

      default:
        return <span className="text-sm">{value || '-'}</span>;
    }
  };

  return (
    <TableCell className={className}>
      {renderEditableContent()}
    </TableCell>
  );
};

export default EditableTableCell;