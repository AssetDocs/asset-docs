// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from '@/contexts/AccountContext';

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

const PAGE_SIZE = 200;

export function useAssetValues() {
  const { activeAccountId } = (() => {
    try { return useAccount(); } catch { return { activeAccountId: null } as any; }
  })();
  const [entries, setEntries] = useState<AssetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllAssetValues = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEntries([]);
        return;
      }

      // Resolve account id (active context, else owner account)
      let accountId: string | null = activeAccountId ?? null;
      if (!accountId) {
        const { data: a } = await supabase
          .from('accounts').select('id').eq('owner_user_id', user.id).maybeSingle();
        accountId = a?.id ?? null;
      }
      if (!accountId) {
        setEntries([]);
        return;
      }

      // Paginate the RPC using a deterministic 1-based ordinal cursor.
      const all: AssetEntry[] = [];
      let cursor = 0;
      // Hard cap to avoid runaway loops.
      for (let i = 0; i < 100; i++) {
        const { data, error } = await supabase.rpc('get_asset_values_page', {
          p_account_id: accountId,
          p_limit: PAGE_SIZE,
          p_cursor_ordinal: cursor,
          p_cursor_id: null,
        });
        if (error) {
          console.error('get_asset_values_page error', error);
          break;
        }
        const rows = (data ?? []) as Array<any>;
        if (rows.length === 0) break;
        for (const r of rows) {
          all.push({
            id: r.entry_id,
            name: r.entry_name,
            value: Number(r.value) || 0,
            source: r.source,
            category: r.category,
            parentName: r.parent_name ?? undefined,
            date: r.entry_date,
          });
        }
        const last = rows[rows.length - 1];
        const nextCursor = Number(last.item_ordinal);
        if (!Number.isFinite(nextCursor) || nextCursor <= cursor) break;
        cursor = nextCursor;
        if (rows.length < PAGE_SIZE) break;
      }

      setEntries(all);
    } catch (error) {
      console.error('Error loading asset values:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeAccountId]);

  useEffect(() => {
    loadAllAssetValues();
  }, [loadAllAssetValues]);

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
