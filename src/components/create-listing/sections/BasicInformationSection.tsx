
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
  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 
    'Toys', 'Automotive', 'Health & Beauty', 'Jewelry', 'Other'
  ];

  const conditions = ['New', 'Like New', 'Used', 'Fair', 'Poor'];

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
            placeholder="Item title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={listingData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Item description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={listingData.price}
              onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
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
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={listingData.category} 
            onValueChange={(value) => onUpdate({ category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {listingData.priceResearch && (
          <div>
            <Label htmlFor="priceResearch">Price Research</Label>
            <Textarea
              id="priceResearch"
              value={listingData.priceResearch}
              onChange={(e) => onUpdate({ priceResearch: e.target.value })}
              placeholder="Price research notes"
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicInformationSection;
