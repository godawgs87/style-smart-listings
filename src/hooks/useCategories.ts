
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      // Build hierarchical structure
      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      // First pass: create all categories
      data.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Second pass: build hierarchy
      data.forEach(cat => {
        const category = categoryMap.get(cat.id)!;
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children!.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });

      setCategories(rootCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (id: string | null): Category | null => {
    if (!id) return null;
    
    const findCategory = (cats: Category[]): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(categories);
  };

  const getCategoryPath = (categoryId: string | null): Category[] => {
    if (!categoryId) return [];
    
    const path: Category[] = [];
    const findPath = (cats: Category[], targetId: string, currentPath: Category[]): boolean => {
      for (const cat of cats) {
        const newPath = [...currentPath, cat];
        if (cat.id === targetId) {
          path.push(...newPath);
          return true;
        }
        if (cat.children && findPath(cat.children, targetId, newPath)) {
          return true;
        }
      }
      return false;
    };

    findPath(categories, categoryId, []);
    return path;
  };

  return {
    categories,
    loading,
    error,
    getCategoryById,
    getCategoryPath,
    refetch: fetchCategories
  };
};
