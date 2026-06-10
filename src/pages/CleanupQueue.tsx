import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingItem {
  resource: string;
  id: string;
  label: string;
  display_name: string | null;
  pending_delete_at: string | null;
  delete_attempts: number;
  has_error: boolean;
  is_processing: boolean;
}

const formatWhen = (iso: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
};

export default function CleanupQueue() {
  const { toast } = useToast();
  const [items, setItems] = useState<PendingItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'list-pending-file-deletions',
        { body: {} },
      );
      if (error) throw error;
      setItems(((data as any)?.items ?? []) as PendingItem[]);
    } catch (e) {
      console.error('cleanup list failed', e);
      toast({
        title: 'Could not load cleanup queue',
        description: 'Please try again.',
        variant: 'destructive',
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const retryOne = async (item: PendingItem) => {
    setRetrying(item.id);
    try {
      const { data, error } = await supabase.functions.invoke('secure-delete-file', {
        body: { resource: item.resource, id: item.id },
      });
      const ok = !error && (data as any)?.ok === true;
      if (ok) {
        toast({ title: 'Cleanup completed', description: 'The file was removed.' });
        setItems((cur) => (cur ?? []).filter((x) => x.id !== item.id));
      } else {
        const code = (data as any)?.code || (data as any)?.error;
        toast({
          title: 'Still pending',
          description:
            code === 'in_progress'
              ? 'A cleanup attempt is already running. Please wait a moment and retry.'
              : 'The file could not be fully deleted. Please try again.',
          variant: 'destructive',
        });
        // Refresh to pick up updated attempts / processing flag.
        load();
      }
    } catch (e) {
      console.error('retry failed', e);
      toast({
        title: 'Retry failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRetrying(null);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to account
          </Link>
          <h1 className="text-2xl font-semibold mt-2">Items needing cleanup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Files whose deletion did not finish. Retry to remove them safely.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && items === null ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (items?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nothing to clean up. All deletions have completed.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items!.map((item) => (
            <Card key={`${item.resource}:${item.id}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {item.has_error && (
                    <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
                  )}
                  <span>{item.display_name || item.label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {item.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Pending since: {formatWhen(item.pending_delete_at)}</div>
                  <div>
                    Attempts: {item.delete_attempts}
                    {item.is_processing && ' · currently processing'}
                    {item.has_error && !item.is_processing && ' · last attempt failed'}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => retryOne(item)}
                  disabled={retrying === item.id || item.is_processing}
                >
                  {retrying === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Retry'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
