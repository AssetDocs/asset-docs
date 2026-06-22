// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Database, AlertTriangle, CheckCircle, RefreshCw, HardDrive, FileText, Shield, EyeOff } from 'lucide-react';

interface TableStats {
  table_name: string;
  row_count: number;
}

interface StorageBucket {
  name: string;
  file_count: number;
  total_size: number;
}

interface RLSStatus {
  table_name: string;
  rls_enabled: boolean;
}

interface StorageOrphanCandidate {
  id: string;
  bucket: string;
  object_path: string;
  object_size_bytes: number | null;
  first_seen_at: string;
  last_seen_at: string;
  status: string;
  approved_at: string | null;
}

interface StorageUsageDriftState {
  user_id: string;
  last_reconciled_at: string;
  last_drift_bytes: number;
  last_drift_ratio: number;
  last_corrected: boolean;
}

interface CronJobHealthState {
  health_status: string | null;
  last_error: string | null;
  last_result: Record<string, unknown> | null;
  last_status: string | null;
  last_succeeded_at: string | null;
  minutes_since_success: number | null;
}

interface StorageBucketLifecycleStatus {
  bucket: string;
  data_class: string;
  expected_public: boolean;
  actual_public: boolean | null;
  bucket_exists: boolean;
  public_matches: boolean;
  lifecycle_days: number | null;
  cleanup_owner: string;
  launch_required: boolean;
  retention_rule: string;
  notes: string | null;
  max_bucket_bytes: number | null;
  alert_threshold_ratio: number;
  actual_total_bytes: number;
  cap_usage_ratio: number | null;
  within_size_cap: boolean;
  size_alert: boolean;
}

const AdminDatabase = () => {
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [storageBuckets, setStorageBuckets] = useState<StorageBucket[]>([]);
  const [bucketLifecycleStatuses, setBucketLifecycleStatuses] = useState<StorageBucketLifecycleStatus[]>([]);
  const [orphanCandidates, setOrphanCandidates] = useState<StorageOrphanCandidate[]>([]);
  const [driftStates, setDriftStates] = useState<StorageUsageDriftState[]>([]);
  const [driftCronHealth, setDriftCronHealth] = useState<CronJobHealthState | null>(null);
  const [recentErrors, setRecentErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    setLoading(true);
    try {
      // Get table row counts for main tables
      const tables = [
        'profiles',
        'properties',
        'items',
        'property_files',
        'subscribers',
        'gift_subscriptions',
        'payment_events',
        'contributors',
        'legacy_locker',
        'trust_information',
        'events',
        'leads'
      ];

      const stats: TableStats[] = [];
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table as any)
            .select('*', { count: 'exact', head: true });
          
          if (!error && count !== null) {
            stats.push({ table_name: table, row_count: count });
          }
        } catch (e) {
          // Table might not be accessible due to RLS
          stats.push({ table_name: table, row_count: -1 });
        }
      }

      setTableStats(stats);

      // Get storage usage
      const { data: storageData } = await supabase
        .from('storage_usage')
        .select('bucket_name, file_count, total_size_bytes');

      if (storageData) {
        const buckets = storageData.reduce((acc: StorageBucket[], curr) => {
          const existing = acc.find(b => b.name === curr.bucket_name);
          if (existing) {
            existing.file_count += curr.file_count;
            existing.total_size += curr.total_size_bytes;
          } else {
            acc.push({
              name: curr.bucket_name,
              file_count: curr.file_count,
              total_size: curr.total_size_bytes
            });
          }
          return acc;
        }, []);
        setStorageBuckets(buckets);
      }

      const { data: orphanData, error: orphanError } = await supabase
        .from('storage_orphan_candidates')
        .select('id,bucket,object_path,object_size_bytes,first_seen_at,last_seen_at,status,approved_at')
        .in('status', ['candidate', 'approved', 'queued'])
        .order('last_seen_at', { ascending: false })
        .limit(25);

      if (!orphanError && orphanData) {
        setOrphanCandidates(orphanData as StorageOrphanCandidate[]);
      }

      const { data: driftData, error: driftError } = await supabase
        .from('storage_usage_reconciliation_state')
        .select('user_id,last_reconciled_at,last_drift_bytes,last_drift_ratio,last_corrected')
        .order('last_reconciled_at', { ascending: false })
        .limit(25);

      if (!driftError && driftData) {
        setDriftStates(driftData as StorageUsageDriftState[]);
      }

      const { data: driftCronData, error: driftCronError } = await supabase
        .from('cron_job_health_status')
        .select('health_status,last_error,last_result,last_status,last_succeeded_at,minutes_since_success')
        .eq('job_name', 'process-storage-usage-drift')
        .maybeSingle();

      if (!driftCronError && driftCronData) {
        setDriftCronHealth(driftCronData as CronJobHealthState);
      }

      const { data: bucketLifecycleData, error: bucketLifecycleError } = await supabase
        .rpc('get_storage_bucket_lifecycle_status' as any);

      if (!bucketLifecycleError && bucketLifecycleData) {
        setBucketLifecycleStatuses(bucketLifecycleData as StorageBucketLifecycleStatus[]);
      }

      // Check for any issues
      const issues: string[] = [];
      
      // Check if any tables have RLS issues (can't be read)
      const rlsIssues = stats.filter(s => s.row_count === -1);
      if (rlsIssues.length > 0) {
        issues.push(`${rlsIssues.length} tables have restricted access (RLS)`);
      }

      if (orphanData?.some((candidate) => candidate.status === 'candidate')) {
        issues.push('Storage orphan candidates need review');
      }

      if (driftData?.some((state) => state.last_corrected)) {
        issues.push('Recent storage usage drift corrections detected');
      }

      if (driftCronData?.health_status && driftCronData.health_status !== 'healthy') {
        issues.push('Storage usage drift cron job needs attention');
      }

      if (bucketLifecycleData?.some((bucket) => bucket.launch_required && !bucket.bucket_exists)) {
        issues.push('Required storage bucket missing');
      }

      if (bucketLifecycleData?.some((bucket) => bucket.bucket_exists && !bucket.public_matches)) {
        issues.push('Storage bucket public/private setting mismatch');
      }

      if (bucketLifecycleData?.some((bucket) => bucket.size_alert || bucket.within_size_cap === false)) {
        issues.push('Storage bucket size cap needs attention');
      }

      setRecentErrors(issues);
      setHealthStatus(issues.length > 0 ? 'warning' : 'healthy');

    } catch (error) {
      console.error('Error loading database stats:', error);
      setHealthStatus('error');
      setRecentErrors(['Failed to connect to database']);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHealthIcon = () => {
    switch (healthStatus) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
  };

  const getTotalRows = () => {
    return tableStats.reduce((sum, t) => sum + (t.row_count > 0 ? t.row_count : 0), 0);
  };

  const getTotalStorage = () => {
    return storageBuckets.reduce((sum, b) => sum + b.total_size, 0);
  };

  const getTotalFiles = () => {
    return storageBuckets.reduce((sum, b) => sum + b.file_count, 0);
  };

  const getOrphanCount = (status: string) => {
    return orphanCandidates.filter((candidate) => candidate.status === status).length;
  };

  const getCorrectedDriftCount = () => {
    return driftStates.filter((state) => state.last_corrected).length;
  };

  const getHighDriftCount = () => {
    return driftStates.filter((state) => Math.abs(state.last_drift_bytes) > 50 * 1024 * 1024 || Number(state.last_drift_ratio) > 0.05).length;
  };

  const getBucketLifecycleIssueCount = () => {
    return bucketLifecycleStatuses.filter((bucket) => (
      !bucket.bucket_exists
      || !bucket.public_matches
      || bucket.size_alert
      || bucket.within_size_cap === false
    )).length;
  };

  const getBucketLifecycleBadgeClass = (bucket: StorageBucketLifecycleStatus) => {
    if (!bucket.bucket_exists) return 'bg-red-500';
    if (bucket.within_size_cap === false) return 'bg-red-500';
    if (!bucket.public_matches) return 'bg-yellow-500';
    if (bucket.size_alert) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBucketLifecycleLabel = (bucket: StorageBucketLifecycleStatus) => {
    if (!bucket.bucket_exists) return 'missing';
    if (bucket.within_size_cap === false) return 'over cap';
    if (!bucket.public_matches) return 'visibility mismatch';
    if (bucket.size_alert) return 'near cap';
    return bucket.actual_public ? 'public' : 'private';
  };

  const getDriftCronBadgeClass = () => {
    if (driftCronHealth?.health_status === 'healthy') return 'bg-green-500';
    if (driftCronHealth?.health_status === 'critical') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const updateOrphanStatus = async (candidate: StorageOrphanCandidate, status: 'approved' | 'ignored') => {
    setActionLoading(candidate.id);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      const patch =
        status === 'approved'
          ? {
              status,
              approved_at: now,
              approved_by: authData.user?.id ?? null,
              notes: 'Approved from Admin Database storage operations panel',
            }
          : {
              status,
              notes: 'Ignored from Admin Database storage operations panel',
            };

      const { error } = await supabase
        .from('storage_orphan_candidates')
        .update(patch)
        .eq('id', candidate.id);

      if (error) throw error;
      await loadDatabaseStats();
    } catch (error) {
      console.error('Error updating storage orphan candidate:', error);
      setRecentErrors(['Failed to update storage orphan candidate']);
      setHealthStatus('error');
    } finally {
      setActionLoading(null);
    }
  };

  const updateBulkOrphanStatus = async (status: 'approved' | 'ignored') => {
    const pendingIds = orphanCandidates
      .filter((candidate) => candidate.status === 'candidate')
      .map((candidate) => candidate.id);

    if (pendingIds.length === 0) return;

    setActionLoading(`bulk-${status}`);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      const patch =
        status === 'approved'
          ? {
              status,
              approved_at: now,
              approved_by: authData.user?.id ?? null,
              notes: `Bulk approved ${pendingIds.length} candidate(s) from Admin Database storage operations panel`,
            }
          : {
              status,
              notes: `Bulk ignored ${pendingIds.length} candidate(s) from Admin Database storage operations panel`,
            };

      const { error } = await supabase
        .from('storage_orphan_candidates')
        .update(patch)
        .in('id', pendingIds);

      if (error) throw error;
      await loadDatabaseStats();
    } catch (error) {
      console.error('Error bulk updating storage orphan candidates:', error);
      setRecentErrors(['Failed to bulk update storage orphan candidates']);
      setHealthStatus('error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Database Health</h2>
          <p className="text-muted-foreground">Monitor database status, tables, and storage</p>
        </div>
        <Button onClick={loadDatabaseStats} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getHealthIcon()}
            <div>
              <CardTitle>
                Database Status: {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
              </CardTitle>
              <CardDescription>
                Last checked: {new Date().toLocaleString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {recentErrors.length > 0 && (
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Issues Detected</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2">
                  {recentErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{getTotalRows().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{tableStats.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{getTotalFiles().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{formatBytes(getTotalStorage())}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orphan Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold">{getOrphanCount('candidate')}</span>
              <span className="text-sm text-muted-foreground">pending</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bucket Policy Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <span className="text-2xl font-bold">{getBucketLifecycleIssueCount()}</span>
              <span className="text-sm text-muted-foreground">open</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Table Statistics</CardTitle>
            <CardDescription>Row counts per table</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead className="text-right">Row Count</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableStats.map((table) => (
                    <TableRow key={table.table_name}>
                      <TableCell className="font-mono text-sm">{table.table_name}</TableCell>
                      <TableCell className="text-right">
                        {table.row_count >= 0 ? table.row_count.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {table.row_count >= 0 ? (
                          <Badge className="bg-green-500">OK</Badge>
                        ) : (
                          <Badge variant="secondary">Restricted</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Storage Buckets */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Buckets</CardTitle>
            <CardDescription>File storage usage by bucket</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : storageBuckets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bucket</TableHead>
                    <TableHead className="text-right">Files</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storageBuckets.map((bucket) => (
                    <TableRow key={bucket.name}>
                      <TableCell className="font-medium">{bucket.name}</TableCell>
                      <TableCell className="text-right">{bucket.file_count.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatBytes(bucket.total_size)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No storage data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bucket Lifecycle Policies</CardTitle>
          <CardDescription>
            Canonical bucket inventory, private/public expectations, and cleanup ownership.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : bucketLifecycleStatuses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Data Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cleanup</TableHead>
                  <TableHead className="text-right">Usage / Cap</TableHead>
                  <TableHead>Retention</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bucketLifecycleStatuses.map((bucket) => (
                  <TableRow key={bucket.bucket}>
                    <TableCell>
                      <div className="font-medium">{bucket.bucket}</div>
                      {bucket.launch_required && (
                        <div className="text-xs text-muted-foreground">Launch required</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{bucket.data_class}</TableCell>
                    <TableCell>
                      <Badge className={getBucketLifecycleBadgeClass(bucket)}>
                        {getBucketLifecycleLabel(bucket)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{bucket.cleanup_owner}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{formatBytes(bucket.actual_total_bytes || 0)}</div>
                      <div className="text-xs text-muted-foreground">
                        {bucket.max_bucket_bytes ? `${formatBytes(bucket.max_bucket_bytes)} cap` : 'No cap'}
                      </div>
                      {bucket.cap_usage_ratio !== null && (
                        <div className="text-xs text-muted-foreground">
                          {(Number(bucket.cap_usage_ratio) * 100).toFixed(1)}%
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[420px] text-sm">{bucket.retention_rule}</div>
                      {bucket.lifecycle_days && (
                        <div className="text-xs text-muted-foreground">
                          Target: {bucket.lifecycle_days} day{bucket.lifecycle_days === 1 ? '' : 's'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No bucket lifecycle policies available</p>
          )}
          {getBucketLifecycleIssueCount() > 0 && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Bucket Policy Mismatch</AlertTitle>
              <AlertDescription>
                Create missing launch-required buckets through the Storage UI, keep public access aligned, and review any bucket approaching or exceeding its operational cap.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Storage Orphan Review</CardTitle>
                <CardDescription>
                  Review objects found in storage with no matching database row. Approved rows are queued by the next orphan sweeper run.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={getOrphanCount('candidate') === 0 || !!actionLoading}
                  onClick={() => updateBulkOrphanStatus('ignored')}
                >
                  Ignore All
                </Button>
                <Button
                  size="sm"
                  disabled={getOrphanCount('candidate') === 0 || !!actionLoading}
                  onClick={() => updateBulkOrphanStatus('approved')}
                >
                  Approve All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : orphanCandidates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Object</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orphanCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="font-medium">{candidate.bucket}</div>
                        <div className="max-w-[320px] truncate text-xs text-muted-foreground" title={candidate.object_path}>
                          {candidate.object_path}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Seen {new Date(candidate.last_seen_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={candidate.status === 'candidate' ? 'secondary' : 'default'}>
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {candidate.object_size_bytes ? formatBytes(candidate.object_size_bytes) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading === candidate.id || candidate.status !== 'candidate'}
                            onClick={() => updateOrphanStatus(candidate, 'ignored')}
                          >
                            Ignore
                          </Button>
                          <Button
                            size="sm"
                            disabled={actionLoading === candidate.id || candidate.status !== 'candidate'}
                            onClick={() => updateOrphanStatus(candidate, 'approved')}
                          >
                            Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orphan candidates need review</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Storage Usage Drift</CardTitle>
                <CardDescription>
                  Latest reconciliation state from `process-storage-usage-drift`.
                </CardDescription>
              </div>
              <Badge className={getDriftCronBadgeClass()}>
                {driftCronHealth?.health_status || 'unknown'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Last success</div>
                <div className="font-medium">
                  {driftCronHealth?.last_succeeded_at ? new Date(driftCronHealth.last_succeeded_at).toLocaleString() : '-'}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Minutes since success</div>
                <div className="font-medium">{driftCronHealth?.minutes_since_success ?? '-'}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">High drift rows</div>
                <div className="font-medium">{getHighDriftCount()}</div>
              </div>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : driftStates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Drift</TableHead>
                    <TableHead className="text-right">Ratio</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driftStates.map((state) => (
                    <TableRow key={state.user_id}>
                      <TableCell>
                        <div className="font-mono text-xs">{state.user_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(state.last_reconciled_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBytes(Math.abs(state.last_drift_bytes))}
                      </TableCell>
                      <TableCell className="text-right">{formatPercent(Number(state.last_drift_ratio))}</TableCell>
                      <TableCell>
                        {state.last_corrected ? (
                          <Badge className="bg-yellow-500">Corrected</Badge>
                        ) : (
                          <Badge className="bg-green-500">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No storage drift data available</p>
            )}
            {getCorrectedDriftCount() > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Recent Corrections</AlertTitle>
                <AlertDescription>
                  {getCorrectedDriftCount()} account(s) had storage usage corrected during recent reconciliation.
                </AlertDescription>
              </Alert>
            )}
            {getHighDriftCount() > 0 && (
              <Alert className="mt-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>High Drift Detected</AlertTitle>
                <AlertDescription>
                  {getHighDriftCount()} account(s) exceeded the 5% or 50 MB drift threshold in the latest visible reconciliation state.
                </AlertDescription>
              </Alert>
            )}
            {driftCronHealth?.last_error && (
              <Alert className="mt-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Drift Job Error</AlertTitle>
                <AlertDescription>{driftCronHealth.last_error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Security Overview</CardTitle>
          </div>
          <CardDescription>Row Level Security status for database tables</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>RLS Enabled</AlertTitle>
            <AlertDescription>
              All public tables have Row Level Security (RLS) enabled to protect user data.
              Tables marked as "Restricted" above indicate proper RLS policies are preventing 
              unauthorized access from this admin context.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDatabase;
