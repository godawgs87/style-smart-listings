
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories, Category } from '@/hooks/useCategories';
import { ChevronRight } from 'lucide-react';

interface CategorySelectorProps {
  value?: string | null;
  onChange: (categoryId: string | null) => void;
  placeholder?: string;
  className?: string;
}

const CategorySelector = ({ 
  value, 
  onChange, 
  placeholder = "Select a category",
  className 
}: CategorySelectorProps) => {
  const { categories, loading, getCategoryById, getCategoryPath } = useCategories();
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);

  React.useEffect(() => {
    if (value) {
      const path = getCategoryPath(value);
      setSelectedPath(path);
    } else {
      setSelectedPath([]);
    }
  }, [value, getCategoryPath]);

  const getCurrentLevelCategories = (): Category[] => {
    if (selectedPath.length === 0) {
      return categories;
    }
    
    const lastSelected = selectedPath[selectedPath.length - 1];
    return lastSelected.children || [];
  };

  const handleLevelSelect = (categoryId: string, level: number) => {
    const category = getCategoryById(categoryId);
    if (!category) return;

    const newPath = selectedPath.slice(0, level).concat(category);
    setSelectedPath(newPath);

    // If this category has no children, it's the final selection
    if (!category.children || category.children.length === 0) {
      onChange(categoryId);
    } else {
      // If we're selecting a parent category, clear the final selection
      onChange(null);
    }
  };

  const renderBreadcrumb = () => {
    if (selectedPath.length === 0) return null;

    return (
      <div className="flex items-center text-sm text-gray-600 mb-2">
        {selectedPath.map((cat, index) => (
          <React.Fragment key={cat.id}>
            <span 
              className="cursor-pointer hover:text-gray-800"
              onClick={() => {
                const newPath = selectedPath.slice(0, index + 1);
                setSelectedPath(newPath);
                onChange(null);
              }}
            >
              {cat.name}
            </span>
            {index < selectedPath.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-1" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const getDisplayValue = () => {
    if (value) {
      const category = getCategoryById(value);
      return category ? category.name : 'Unknown category';
    }
    return placeholder;
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  const currentLevel = getCurrentLevelCategories();
  const canSelectCurrent = currentLevel.length > 0;

  return (
    <div className={className}>
      {renderBreadcrumb()}
      
      {canSelectCurrent && (
        <Select
          value=""
          onValueChange={(categoryId) => {
            const level = selectedPath.length;
            handleLevelSelect(categoryId, level);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              selectedPath.length === 0 
                ? placeholder 
                : `Select ${selectedPath[selectedPath.length - 1]?.children?.length ? 'subcategory' : 'category'}`
            } />
          </SelectTrigger>
          <SelectContent>
            {currentLevel.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{category.name}</span>
                  {category.children && category.children.length > 0 && (
                    <ChevronRight className="w-4 h-4 ml-2" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {value && (
        <div className="mt-2 text-sm">
          <span className="font-medium">Selected: </span>
          <span className="text-blue-600">{getDisplayValue()}</span>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
