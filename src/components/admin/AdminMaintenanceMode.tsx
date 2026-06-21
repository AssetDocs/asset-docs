// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Power, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type MaintenanceModeRow = {
  id: string;
  created_by: string | null;
  ended_by: string | null;
  ends_at: string | null;
  message: string | null;
  reason: string;
  starts_at: string;
  status: string;
};

type ActiveMaintenanceMode = {
  is_active: boolean;
  id: string | null;
  reason: string | null;
  message: string | null;
  started_at: string | null;
  ends_at: string | null;
};

const DEFAULT_MESSAGE = 'Asset Safe is in maintenance mode. Your records remain available, but changes are temporarily paused.';

const toIsoOrNull = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};

const AdminMaintenanceMode: React.FC = () => {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<ActiveMaintenanceMode | null>(null);
  const [history, setHistory] = useState<MaintenanceModeRow[]>([]);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [endsAt, setEndsAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = !!activeMode?.is_active;

  const loadMaintenance = async () => {
    setLoading(true);
    setError(null);

    const [{ data: activeData, error: activeError }, { data: historyData, error: historyError }] = await Promise.all([
      supabase.rpc('get_active_maintenance_mode').maybeSingle(),
      supabase
        .from('system_maintenance_windows')
        .select('id,created_by,ended_by,ends_at,message,reason,starts_at,status')
        .order('starts_at', { ascending: false })
        .limit(20),
    ]);

    if (activeError || historyError) {
      setError(activeError?.message || historyError?.message || 'Unable to load maintenance mode');
    }

    setActiveMode((activeData || null) as ActiveMaintenanceMode | null);
    setHistory((historyData || []) as MaintenanceModeRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  const activeSummary = useMemo(() => {
    if (!isActive) return 'Writes are currently open.';
    const end = activeMode?.ends_at ? ` Ends ${format(new Date(activeMode.ends_at), 'PP p')}.` : ' No scheduled end time.';
    return `${activeMode?.reason || 'Maintenance mode active'}.${end}`;
  }, [activeMode, isActive]);

  const activateMaintenance = async () => {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      const { error: rpcError } = await supabase.rpc('activate_maintenance_mode', {
        p_reason: reason.trim(),
        p_message: message.trim() || DEFAULT_MESSAGE,
        p_ends_at: toIsoOrNull(endsAt),
        p_metadata: { source: 'admin_maintenance_mode_panel' },
      });

      if (rpcError) throw rpcError;

      toast({ title: 'Maintenance mode activated', description: 'User writes are now paused by the maintenance guard.' });
      setReason('');
      setMessage(DEFAULT_MESSAGE);
      setEndsAt('');
      await loadMaintenance();
    } catch (err: any) {
      toast({
        title: 'Unable to activate maintenance mode',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const endMaintenance = async () => {
    setSaving(true);
    try {
      const { error: rpcError } = await supabase.rpc('end_maintenance_mode', {
        p_id: activeMode?.id ?? undefined,
      });

      if (rpcError) throw rpcError;

      toast({ title: 'Maintenance mode ended', description: 'Normal write access can resume.' });
      await loadMaintenance();
    } catch (err: any) {
      toast({
        title: 'Unable to end maintenance mode',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Maintenance Mode</h2>
          <p className="text-sm text-muted-foreground">Pause writes during restore drills, migrations, or operational incidents.</p>
        </div>
        <Button variant="outline" onClick={loadMaintenance} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Alert className={isActive ? 'border-amber-300 bg-amber-50 text-amber-950' : ''}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{isActive ? 'Maintenance mode active' : 'Maintenance mode inactive'}</AlertTitle>
        <AlertDescription>{activeSummary}</AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to load maintenance mode</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activate Freeze-Writes Mode</CardTitle>
            <CardDescription>The global banner appears immediately, and write guards treat accounts as read-only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance-reason">Reason</Label>
              <Input
                id="maintenance-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="PITR restore drill, migration, incident response..."
                disabled={saving || isActive}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">User-facing message</Label>
              <Textarea
                id="maintenance-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                disabled={saving || isActive}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-ends-at">Scheduled end</Label>
              <Input
                id="maintenance-ends-at"
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
                disabled={saving || isActive}
              />
            </div>
            <Button onClick={activateMaintenance} disabled={!reason.trim() || saving || isActive} className="w-full">
              <Power className="mr-2 h-4 w-4" />
              Activate Maintenance Mode
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Mode</CardTitle>
            <CardDescription>End the active maintenance window once restore or incident work is complete.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={isActive ? 'destructive' : 'secondary'}>{isActive ? 'active' : 'inactive'}</Badge>
              </div>
              <div className="mt-3 grid gap-2">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="text-right">{activeMode?.reason || '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Started</span>
                  <span>{activeMode?.started_at ? format(new Date(activeMode.started_at), 'PP p') : '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Ends</span>
                  <span>{activeMode?.ends_at ? format(new Date(activeMode.ends_at), 'PP p') : '-'}</span>
                </div>
              </div>
            </div>
            <Button variant="destructive" onClick={endMaintenance} disabled={!isActive || saving} className="w-full">
              End Maintenance Mode
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance Windows</CardTitle>
          <CardDescription>Latest system_maintenance_windows records for restore and incident audit review.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Ended By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(row.starts_at), 'PP p')}</TableCell>
                    <TableCell><Badge variant={row.status === 'active' ? 'destructive' : 'secondary'}>{row.status}</Badge></TableCell>
                    <TableCell className="max-w-[280px] truncate" title={row.reason}>{row.reason}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.ends_at ? format(new Date(row.ends_at), 'PP p') : '-'}</TableCell>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs" title={row.created_by || ''}>{row.created_by || '-'}</TableCell>
                    <TableCell className="max-w-[160px] truncate font-mono text-xs" title={row.ended_by || ''}>{row.ended_by || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No maintenance windows recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMaintenanceMode;
