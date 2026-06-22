// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

type SupportIssueRow = {
  id: string;
  created_at: string;
  pii_scrub_metadata: Record<string, unknown> | null;
  pii_scrubbed_at: string | null;
  priority: string;
  status: string;
  title: string;
  type: string;
  updated_at: string;
};

type CronHealthRow = {
  health_status: string | null;
  job_name: string | null;
  last_duration_ms: number | null;
  last_error: string | null;
  last_result: Record<string, unknown> | null;
  last_status: string | null;
  last_succeeded_at: string | null;
  minutes_since_success: number | null;
};

type ScrubRunRow = {
  id: string;
  completed_at: string;
  cutoff_at: string;
  dry_run: boolean;
  duration_ms: number | null;
  eligible_count: number;
  error_message: string | null;
  issue_ids: string[];
  retention_days: number;
  scrubbed_count: number;
  status: string;
};

const SUPPORT_RETENTION_DAYS = 1095;

const statusVariant = (status?: string | null) => {
  if (status === 'healthy' || status === 'succeeded') return 'default';
  if (status === 'critical' || status === 'failed') return 'destructive';
  return 'secondary';
};

const AdminSupportPiiReport: React.FC = () => {
  const [issues, setIssues] = useState<SupportIssueRow[]>([]);
  const [scrubRuns, setScrubRuns] = useState<ScrubRunRow[]>([]);
  const [cronHealth, setCronHealth] = useState<CronHealthRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cutoff = useMemo(() => {
    return new Date(Date.now() - SUPPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  }, []);

  const loadReport = async () => {
    setLoading(true);
    setError(null);

    const [
      { data: issueData, error: issueError },
      { data: cronData, error: cronError },
      { data: runData, error: runError },
    ] = await Promise.all([
      supabase
        .from('dev_support_issues')
        .select('id,created_at,pii_scrub_metadata,pii_scrubbed_at,priority,status,title,type,updated_at')
        .in('status', ['resolved', 'wont_fix'])
        .order('updated_at', { ascending: false })
        .limit(100),
      supabase
        .from('cron_job_health_status')
        .select('health_status,job_name,last_duration_ms,last_error,last_result,last_status,last_succeeded_at,minutes_since_success')
        .eq('job_name', 'scrub-old-support-pii')
        .maybeSingle(),
      supabase
        .from('support_pii_scrub_runs')
        .select('id,completed_at,cutoff_at,dry_run,duration_ms,eligible_count,error_message,issue_ids,retention_days,scrubbed_count,status')
        .order('completed_at', { ascending: false })
        .limit(25),
    ]);

    if (issueError || cronError || runError) {
      setError(issueError?.message || cronError?.message || runError?.message || 'Unable to load support PII report');
    }

    setIssues((issueData || []) as SupportIssueRow[]);
    setScrubRuns((runData || []) as ScrubRunRow[]);
    setCronHealth((cronData || null) as CronHealthRow | null);
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, []);

  const scrubbed = issues.filter((issue) => !!issue.pii_scrubbed_at);
  const eligible = issues.filter((issue) => !issue.pii_scrubbed_at && new Date(issue.updated_at) <= cutoff);
  const pending = issues.filter((issue) => !issue.pii_scrubbed_at && new Date(issue.updated_at) > cutoff);
  const recentRows = [...eligible, ...scrubbed].slice(0, 25);
  const failedRuns = scrubRuns.filter((run) => run.status === 'failed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Support PII Scrub</h2>
          <p className="text-sm text-muted-foreground">Monitor closed support tickets and the scheduled scrub-old-support-pii retention job.</p>
        </div>
        <Button variant="outline" onClick={loadReport} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to load report</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scrubber Health</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <Badge variant={statusVariant(cronHealth?.health_status)}>{cronHealth?.health_status || 'unknown'}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eligible Unscrubbed</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{eligible.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scrubbed</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{scrubbed.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scrub Failures</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{failedRuns.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Scrubber</CardTitle>
          <CardDescription>Cron health for scrub-old-support-pii. Manual execution stays in the deployment runbook because it requires the internal secret.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Last status</p>
            <Badge variant={statusVariant(cronHealth?.last_status)}>{cronHealth?.last_status || '-'}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Last success</p>
            <p>{cronHealth?.last_succeeded_at ? format(new Date(cronHealth.last_succeeded_at), 'PP p') : '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Minutes since success</p>
            <p>{cronHealth?.minutes_since_success ?? '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last result</p>
            <p className="truncate" title={JSON.stringify(cronHealth?.last_result || {})}>
              {cronHealth?.last_result ? JSON.stringify(cronHealth.last_result) : '-'}
            </p>
          </div>
          {cronHealth?.last_error && (
            <div className="md:col-span-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-destructive">
              {cronHealth.last_error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scrub Run Ledger</CardTitle>
          <CardDescription>Historical scrub-old-support-pii runs, including dry runs, failures, and affected closed support records.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : scrubRuns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Completed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Eligible</TableHead>
                  <TableHead className="text-right">Scrubbed</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>Cutoff</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scrubRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(run.completed_at), 'PP p')}</TableCell>
                    <TableCell><Badge variant={statusVariant(run.status)}>{run.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{run.dry_run ? 'dry run' : 'live'}</Badge></TableCell>
                    <TableCell className="text-right">{run.eligible_count}</TableCell>
                    <TableCell className="text-right">{run.scrubbed_count}</TableCell>
                    <TableCell className="text-right">{run.duration_ms ?? '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{format(new Date(run.cutoff_at), 'PP')}</TableCell>
                    <TableCell className="max-w-[320px] truncate" title={run.error_message || run.issue_ids.join(', ')}>
                      {run.error_message || `${run.issue_ids.length} affected IDs`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No scrub runs recorded yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Closed Support Retention</CardTitle>
          <CardDescription>Resolved or wont-fix support records. Eligible rows are older than {SUPPORT_RETENTION_DAYS} days and have not been scrubbed. {pending.length} closed records are not yet due.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : recentRows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>PII State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRows.map((issue) => {
                  const isEligible = !issue.pii_scrubbed_at && new Date(issue.updated_at) <= cutoff;
                  return (
                    <TableRow key={issue.id}>
                      <TableCell className="whitespace-nowrap">{format(new Date(issue.updated_at), 'PP')}</TableCell>
                      <TableCell><Badge variant="secondary">{issue.status}</Badge></TableCell>
                      <TableCell>{issue.type}</TableCell>
                      <TableCell>{issue.priority}</TableCell>
                      <TableCell className="max-w-[280px] truncate" title={issue.title}>{issue.title}</TableCell>
                      <TableCell>
                        {issue.pii_scrubbed_at ? (
                          <Badge variant="default">scrubbed</Badge>
                        ) : isEligible ? (
                          <Badge variant="destructive">eligible</Badge>
                        ) : (
                          <Badge variant="outline">not due</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No closed support records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportPiiReport;
