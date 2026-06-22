// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

type AccountExportAuditRow = {
  id: string;
  account_id: string | null;
  bundle_file_name: string | null;
  bundle_size_bytes: number | null;
  completed_at: string | null;
  download_count: number | null;
  download_limit: number | null;
  error_message: string | null;
  expires_at: string | null;
  export_type: string;
  file_count: number | null;
  last_downloaded_at: string | null;
  metadata: Record<string, unknown> | null;
  signed_url_ttl_seconds: number | null;
  started_at: string;
  status: string;
  storage_bucket: string | null;
  storage_path: string | null;
  user_id: string | null;
};

type CronHealthRow = {
  health_status: string | null;
  last_error: string | null;
  last_result: Record<string, unknown> | null;
  last_status: string | null;
  last_succeeded_at: string | null;
  minutes_since_success: number | null;
};

const statusVariant = (status: string) => {
  if (status === 'succeeded' || status === 'ready') return 'default';
  if (status === 'failed') return 'destructive';
  return 'secondary';
};

const formatDuration = (start?: string | null, end?: string | null) => {
  if (!start || !end) return '-';
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(durationMs) || durationMs < 0) return '-';
  if (durationMs < 1000) return '<1s';
  return `${Math.round(durationMs / 1000)}s`;
};

const formatTtl = (seconds?: number | null) => {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const AdminExportAudit: React.FC = () => {
  const [rows, setRows] = useState<AccountExportAuditRow[]>([]);
  const [expiredExportHealth, setExpiredExportHealth] = useState<CronHealthRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRows = async () => {
    setLoading(true);
    setError(null);
    const [{ data, error: queryError }, { data: healthData, error: healthError }] = await Promise.all([
      supabase
        .from('account_export_audit')
        .select('id,account_id,bundle_file_name,bundle_size_bytes,completed_at,download_count,download_limit,error_message,expires_at,export_type,file_count,last_downloaded_at,metadata,signed_url_ttl_seconds,started_at,status,storage_bucket,storage_path,user_id')
        .order('started_at', { ascending: false })
        .limit(100),
      supabase
        .from('cron_job_health_status')
        .select('health_status,last_error,last_result,last_status,last_succeeded_at,minutes_since_success')
        .eq('job_name', 'process-expired-exports')
        .maybeSingle(),
    ]);

    if (queryError) {
      setError(queryError.message);
      setRows([]);
    } else {
      setRows((data || []) as AccountExportAuditRow[]);
    }

    if (healthError) {
      setError((current) => current || healthError.message);
      setExpiredExportHealth(null);
    } else {
      setExpiredExportHealth((healthData || null) as CronHealthRow | null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const stats = useMemo(() => {
    const completed = rows.filter((row) => row.status === 'succeeded' || row.status === 'ready').length;
    const failed = rows.filter((row) => row.status === 'failed').length;
    const managedBundles = rows.filter((row) => row.storage_path).length;
    const totalFiles = rows.reduce((sum, row) => sum + (row.file_count || 0), 0);
    return { completed, failed, managedBundles, totalFiles };
  }, [rows]);

  const sweeperHealthClass = () => {
    if (expiredExportHealth?.health_status === 'healthy') return 'bg-green-500';
    if (expiredExportHealth?.health_status === 'critical') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Export Audit</h2>
          <p className="text-sm text-muted-foreground">Recent user/browser export assemblies recorded in account_export_audit.</p>
        </div>
        <Button variant="outline" onClick={loadRows} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Exports</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <span className="text-3xl font-bold">{rows.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.completed}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.failed}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Managed Bundles</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.managedBundles}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Expired Export Sweeper</CardTitle>
              <CardDescription>Health for process-expired-exports, which expires continuity grants and purges stale export bundles.</CardDescription>
            </div>
            <Badge className={sweeperHealthClass()}>{expiredExportHealth?.health_status || 'unknown'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Last status</p>
            <Badge variant={expiredExportHealth?.last_status === 'failed' ? 'destructive' : 'secondary'}>
              {expiredExportHealth?.last_status || '-'}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Last success</p>
            <p>{expiredExportHealth?.last_succeeded_at ? format(new Date(expiredExportHealth.last_succeeded_at), 'PP p') : '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Minutes since success</p>
            <p>{expiredExportHealth?.minutes_since_success ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last result</p>
            <p className="truncate" title={JSON.stringify(expiredExportHealth?.last_result || {})}>
              {expiredExportHealth?.last_result ? JSON.stringify(expiredExportHealth.last_result) : '-'}
            </p>
          </div>
          {expiredExportHealth?.last_error && (
            <div className="md:col-span-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-destructive">
              {expiredExportHealth.last_error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Export Audit</CardTitle>
          <CardDescription>Shows the latest 100 export audit records, including strict-cap bundle state where available.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
          {loading ? (
            <p>Loading...</p>
          ) : rows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Files</TableHead>
                  <TableHead>Bundle</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">TTL</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(row.started_at), 'PP p')}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                    </TableCell>
                    <TableCell>{row.export_type}</TableCell>
                    <TableCell className="max-w-[180px] truncate font-mono text-xs" title={row.user_id || ''}>
                      {row.user_id || '-'}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate font-mono text-xs" title={row.account_id || ''}>
                      {row.account_id || '-'}
                    </TableCell>
                    <TableCell className="text-right">{row.file_count ?? '-'}</TableCell>
                    <TableCell className="max-w-[220px] truncate" title={row.storage_path || ''}>
                      {row.storage_path ? `${row.storage_bucket || 'exports'} / ${row.bundle_file_name || row.storage_path}` : '-'}
                      {row.bundle_size_bytes ? (
                        <span className="ml-1 text-xs text-muted-foreground">({formatBytes(row.bundle_size_bytes)})</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.storage_path ? `${row.download_count ?? 0}/${row.download_limit ?? 5}` : '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.expires_at ? format(new Date(row.expires_at), 'PP p') : '-'}
                    </TableCell>
                    <TableCell className="text-right">{formatTtl(row.signed_url_ttl_seconds)}</TableCell>
                    <TableCell className="text-right">{formatDuration(row.started_at, row.completed_at)}</TableCell>
                    <TableCell className="max-w-[260px] truncate" title={row.error_message || ''}>
                      {row.error_message || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No export audit records yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportAudit;
