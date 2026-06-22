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

type ExportBucketStatus = {
  exists: boolean;
  is_public: boolean | null;
  error: string | null;
};

type ExportFilter = 'all' | 'managed' | 'attention' | 'ready' | 'expired' | 'exhausted';

const statusVariant = (status: string) => {
  if (status === 'succeeded' || status === 'ready') return 'default';
  if (status === 'failed' || status === 'expired') return 'destructive';
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
  const [bucketStatus, setBucketStatus] = useState<ExportBucketStatus | null>(null);
  const [filter, setFilter] = useState<ExportFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRows = async () => {
    setLoading(true);
    setError(null);
    const [{ data, error: queryError }, { data: healthData, error: healthError }, bucketResult] = await Promise.all([
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
      (supabase as any)
        .schema('storage')
        .from('buckets')
        .select('id,public')
        .eq('id', 'exports')
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

    if (bucketResult?.error) {
      setBucketStatus({ exists: false, is_public: null, error: bucketResult.error.message });
    } else {
      setBucketStatus({
        exists: !!bucketResult?.data,
        is_public: bucketResult?.data?.public ?? null,
        error: null,
      });
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
    const requested = rows.filter((row) => row.status === 'requested' || row.status === 'generating').length;
    const ready = rows.filter((row) => row.status === 'ready').length;
    const expired = rows.filter((row) => row.status === 'expired').length;
    const exhausted = rows.filter((row) => row.status === 'exhausted').length;
    const now = Date.now();
    const stuck = rows.filter((row) => {
      if (!row.storage_path || !['requested', 'generating'].includes(row.status)) return false;
      return now - new Date(row.started_at).getTime() > 30 * 60 * 1000;
    }).length;
    const expiringSoon = rows.filter((row) => {
      if (!row.expires_at || row.status !== 'ready') return false;
      const msUntilExpiry = new Date(row.expires_at).getTime() - now;
      return msUntilExpiry > 0 && msUntilExpiry <= 24 * 60 * 60 * 1000;
    }).length;
    return { completed, failed, managedBundles, totalFiles, requested, ready, expired, exhausted, stuck, expiringSoon };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const now = Date.now();
    return rows.filter((row) => {
      if (filter === 'managed') return !!row.storage_path;
      if (filter === 'ready') return row.status === 'ready';
      if (filter === 'expired') return row.status === 'expired';
      if (filter === 'exhausted') return row.status === 'exhausted';
      if (filter === 'attention') {
        if (row.status === 'failed') return true;
        if (!row.storage_path) return false;
        if (row.status === 'expired') return true;
        if (['requested', 'generating'].includes(row.status)) {
          return now - new Date(row.started_at).getTime() > 30 * 60 * 1000;
        }
        return false;
      }
      return true;
    });
  }, [filter, rows]);

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
              <CardTitle>Managed Export Readiness</CardTitle>
              <CardDescription>Launch checks for the private exports bucket and strict-cap bundle lifecycle.</CardDescription>
            </div>
            <Badge className={bucketStatus?.exists && bucketStatus.is_public === false ? 'bg-green-500' : 'bg-yellow-500'}>
              {bucketStatus?.exists ? (bucketStatus.is_public === false ? 'bucket private' : 'bucket public') : 'bucket missing'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!bucketStatus?.exists || bucketStatus?.is_public) && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                {!bucketStatus?.exists
                  ? 'Create a private storage bucket named exports before generating managed account exports.'
                  : 'The exports bucket should be private. Disable public access before launch.'}
                {bucketStatus?.error ? <span className="block text-xs mt-1">Bucket check error: {bucketStatus.error}</span> : null}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Requested</p>
              <p className="text-2xl font-semibold">{stats.requested}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ready</p>
              <p className="text-2xl font-semibold">{stats.ready}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expired</p>
              <p className="text-2xl font-semibold">{stats.expired}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Exhausted</p>
              <p className="text-2xl font-semibold">{stats.exhausted}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Stuck 30m+</p>
              <p className="text-2xl font-semibold">{stats.stuck}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expiring 24h</p>
              <p className="text-2xl font-semibold">{stats.expiringSoon}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="mb-4 flex flex-wrap gap-2">
            {([
              ['all', 'All'],
              ['managed', 'Managed'],
              ['attention', 'Needs Attention'],
              ['ready', 'Ready'],
              ['expired', 'Expired'],
              ['exhausted', 'Exhausted'],
            ] as [ExportFilter, string][]).map(([value, label]) => (
              <Button
                key={value}
                variant={filter === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
          {loading ? (
            <p>Loading...</p>
          ) : filteredRows.length > 0 ? (
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
                {filteredRows.map((row) => (
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
            <p className="py-8 text-center text-muted-foreground">No export audit records match this filter</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportAudit;
