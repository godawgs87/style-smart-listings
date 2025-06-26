
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingData } from '@/types/CreateListing';

interface BasicInformationSectionProps {
  listingData: ListingData;
  onUpdate: (updates: Partial<ListingData>) => void;
}

const BasicInformationSection = ({ listingData, onUpdate }: BasicInformationSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={listingData.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={listingData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={listingData.price}
              onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={listingData.category}
              onChange={(e) => onUpdate({ category: e.target.value })}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="condition">Condition</Label>
          <Select 
            value={listingData.condition} 
            onValueChange={(value) => onUpdate({ condition: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Like New">Like New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInformationSection;
