import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AssetEntry {
  id: string;
  name: string;
  value: number;
  source: 'property' | 'item' | 'file_value';
  category: string;
  /** Parent name for file_value entries (the file they belong to) */
  parentName?: string;
  date: string;
}

export interface AssetSummaryByCategory {
  category: string;
  totalValue: number;
  count: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Real Estate': '#059669',
  'Electronics': '#0EA5E9',
  'Furniture': '#10B981',
  'Jewelry & Watches': '#F59E0B',
  'Appliances': '#EF4444',
  'Art & Collectibles': '#8B5CF6',
  'Tools & Equipment': '#F97316',
  'Clothing': '#EC4899',
  'Sports & Outdoors': '#14B8A6',
  'Musical Instruments': '#6366F1',
  'File Documented Values': '#6D28D9',
  'Other': '#94A3B8',
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}

export function useAssetValues() {
  const [entries, setEntries] = useState<AssetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllAssetValues();
  }, []);

  const loadAllAssetValues = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch all value sources in parallel
      const [propertiesRes, itemsRes, filesRes] = await Promise.all([
        supabase.from('properties').select('id, name, address, estimated_value, created_at').eq('user_id', user.id),
        supabase.from('items').select('id, name, estimated_value, category, created_at').eq('user_id', user.id),
        supabase.from('property_files').select('id, file_name, item_values, created_at').eq('user_id', user.id).not('item_values', 'is', null),
      ]);

      const allEntries: AssetEntry[] = [];

      // 1. Properties (Real Estate)
      if (propertiesRes.data) {
        for (const prop of propertiesRes.data) {
          const val = Number(prop.estimated_value) || 0;
          if (val > 0) {
            allEntries.push({
              id: `prop-${prop.id}`,
              name: prop.name || prop.address || 'Unnamed Property',
              value: val,
              source: 'property',
              category: 'Real Estate',
              date: prop.created_at,
            });
          }
        }
      }

      // 2. Items (Inventory)
      if (itemsRes.data) {
        for (const item of itemsRes.data) {
          const val = Number(item.estimated_value) || 0;
          if (val > 0) {
            allEntries.push({
              id: `item-${item.id}`,
              name: item.name,
              value: val,
              source: 'item',
              category: item.category || 'Other',
              date: item.created_at,
            });
          }
        }
      }

      // 3. Property Files item_values
      if (filesRes.data) {
        for (const file of filesRes.data) {
          if (Array.isArray(file.item_values)) {
            for (const iv of file.item_values as Array<{ name?: string; value?: number | string }>) {
              const val = Number(iv.value) || 0;
              if (val > 0) {
                allEntries.push({
                  id: `fv-${file.id}-${iv.name}`,
                  name: iv.name || 'Unnamed Value',
                  value: val,
                  source: 'file_value',
                  category: 'File Documented Values',
                  parentName: file.file_name,
                  date: file.created_at,
                });
              }
            }
          }
        }
      }

      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading asset values:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute summaries
  const totalValue = entries.reduce((sum, e) => sum + e.value, 0);

  const summaryByCategory: AssetSummaryByCategory[] = (() => {
    const map = new Map<string, { totalValue: number; count: number }>();
    for (const entry of entries) {
      const existing = map.get(entry.category) || { totalValue: 0, count: 0 };
      existing.totalValue += entry.value;
      existing.count += 1;
      map.set(entry.category, existing);
    }
    return Array.from(map.entries())
      .map(([category, data]) => ({
        category,
        totalValue: data.totalValue,
        count: data.count,
        color: getCategoryColor(category),
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  })();

  return {
    entries,
    totalValue,
    summaryByCategory,
    isLoading,
    refresh: loadAllAssetValues,
  };
}
