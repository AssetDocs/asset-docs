// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type RestoreDrillRun = {
  id: string;
  auth_smoke_passed: boolean;
  completed_at: string | null;
  db_smoke_passed: boolean;
  drill_type: string;
  edge_smoke_passed: boolean;
  environment: string;
  findings: string[];
  follow_up_actions: string[];
  notes: string | null;
  operator_user_id: string | null;
  restore_point_at: string | null;
  rpo_minutes: number | null;
  rto_minutes: number | null;
  signed_url_smoke_passed: boolean;
  source_project_ref: string | null;
  started_at: string | null;
  status: string;
  storage_smoke_passed: boolean;
  target_project_ref: string | null;
};

const PROD_PROJECT_REF = 'leotcbfpqiekgkgumecn';

const statusVariant = (status: string) => {
  if (status === 'passed') return 'default';
  if (status === 'failed') return 'destructive';
  if (status === 'in_progress') return 'secondary';
  return 'outline';
};

const splitLines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean);

const toIsoOrNull = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};

const AdminRestoreDrills: React.FC = () => {
  const { toast } = useToast();
  const [runs, setRuns] = useState<RestoreDrillRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [targetProjectRef, setTargetProjectRef] = useState('');
  const [restorePointAt, setRestorePointAt] = useState('');
  const [notes, setNotes] = useState('Quarterly PITR drill');

  const [status, setStatus] = useState('passed');
  const [rpoMinutes, setRpoMinutes] = useState('');
  const [rtoMinutes, setRtoMinutes] = useState('');
  const [findings, setFindings] = useState('No blocking restore issues found');
  const [followUps, setFollowUps] = useState('');
  const [smokeChecks, setSmokeChecks] = useState({
    db_smoke_passed: true,
    storage_smoke_passed: true,
    auth_smoke_passed: true,
    edge_smoke_passed: true,
    signed_url_smoke_passed: true,
  });

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) || null,
    [runs, selectedRunId]
  );

  const loadRuns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('restore_drill_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) {
      toast({ title: 'Unable to load restore drills', description: error.message, variant: 'destructive' });
      setRuns([]);
    } else {
      const rows = (data || []) as RestoreDrillRun[];
      setRuns(rows);
      if (!selectedRunId && rows.length > 0) setSelectedRunId(rows[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRuns();
  }, []);

  useEffect(() => {
    if (!selectedRun) return;
    setStatus(selectedRun.status === 'planned' || selectedRun.status === 'in_progress' ? 'passed' : selectedRun.status);
    setRpoMinutes(selectedRun.rpo_minutes?.toString() || '');
    setRtoMinutes(selectedRun.rto_minutes?.toString() || '');
    setFindings((selectedRun.findings || []).join('\n') || 'No blocking restore issues found');
    setFollowUps((selectedRun.follow_up_actions || []).join('\n'));
    setSmokeChecks({
      db_smoke_passed: selectedRun.db_smoke_passed,
      storage_smoke_passed: selectedRun.storage_smoke_passed,
      auth_smoke_passed: selectedRun.auth_smoke_passed,
      edge_smoke_passed: selectedRun.edge_smoke_passed,
      signed_url_smoke_passed: selectedRun.signed_url_smoke_passed,
    });
  }, [selectedRun]);

  const createRun = async () => {
    setSaving(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase.from('restore_drill_runs').insert({
        environment: 'scratch',
        status: 'in_progress',
        drill_type: 'pitr_to_scratch',
        source_project_ref: PROD_PROJECT_REF,
        target_project_ref: targetProjectRef.trim() || null,
        restore_point_at: toIsoOrNull(restorePointAt),
        started_at: new Date().toISOString(),
        operator_user_id: authData.user?.id ?? null,
        notes: notes.trim() || null,
      });

      if (error) throw error;
      toast({ title: 'Restore drill started', description: 'The drill is now logged as in progress.' });
      setTargetProjectRef('');
      setRestorePointAt('');
      setNotes('Quarterly PITR drill');
      await loadRuns();
    } catch (error: any) {
      toast({ title: 'Unable to start restore drill', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const completeRun = async () => {
    if (!selectedRun) return;
    setSaving(true);
    try {
      const patch = {
        status,
        completed_at: new Date().toISOString(),
        rpo_minutes: rpoMinutes ? Number(rpoMinutes) : null,
        rto_minutes: rtoMinutes ? Number(rtoMinutes) : null,
        findings: splitLines(findings),
        follow_up_actions: splitLines(followUps),
        ...smokeChecks,
      };

      const { error } = await supabase
        .from('restore_drill_runs')
        .update(patch)
        .eq('id', selectedRun.id);

      if (error) throw error;
      toast({ title: 'Restore drill updated', description: `Drill marked ${status}.` });
      await loadRuns();
    } catch (error: any) {
      toast({ title: 'Unable to update restore drill', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const latestPassed = runs.find((run) => run.status === 'passed' && run.completed_at);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Restore Drills</h2>
          <p className="text-sm text-muted-foreground">Log quarterly PITR drills and capture RPO, RTO, smoke checks, and follow-up actions.</p>
        </div>
        <Button variant="outline" onClick={loadRuns} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{runs.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Passed</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium">
            {latestPassed?.completed_at ? format(new Date(latestPassed.completed_at), 'PP') : 'None logged'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {runs.reduce((count, run) => count + (run.follow_up_actions?.length || 0), 0)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Start PITR Drill</CardTitle>
            <CardDescription>Creates an in-progress restore drill row using the backup/restore runbook defaults.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restore-target-ref">Scratch project ref</Label>
              <Input id="restore-target-ref" value={targetProjectRef} onChange={(event) => setTargetProjectRef(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restore-point-at">Restore point</Label>
              <Input id="restore-point-at" type="datetime-local" value={restorePointAt} onChange={(event) => setRestorePointAt(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restore-notes">Notes</Label>
              <Textarea id="restore-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
            </div>
            <Button onClick={createRun} disabled={saving} className="w-full">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Start Drill
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Close Selected Drill</CardTitle>
            <CardDescription>Record outcome, smoke checks, and follow-up actions after the scratch restore is tested.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="restore-status">Status</Label>
                <Input id="restore-status" value={status} onChange={(event) => setStatus(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restore-rpo">RPO minutes</Label>
                <Input id="restore-rpo" type="number" min="0" value={rpoMinutes} onChange={(event) => setRpoMinutes(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restore-rto">RTO minutes</Label>
                <Input id="restore-rto" type="number" min="0" value={rtoMinutes} onChange={(event) => setRtoMinutes(event.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {Object.keys(smokeChecks).map((key) => (
                <label key={key} className="flex items-center gap-2 rounded-md border p-2">
                  <input
                    type="checkbox"
                    checked={smokeChecks[key]}
                    onChange={(event) => setSmokeChecks((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                  {key.replace(/_/g, ' ')}
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="restore-findings">Findings</Label>
              <Textarea id="restore-findings" value={findings} onChange={(event) => setFindings(event.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restore-followups">Follow-up actions</Label>
              <Textarea id="restore-followups" value={followUps} onChange={(event) => setFollowUps(event.target.value)} rows={3} placeholder="One action per line" />
            </div>
            <Button onClick={completeRun} disabled={!selectedRun || saving} className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Outcome
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restore Drill Ledger</CardTitle>
          <CardDescription>Recent restore_drill_runs rows. Select a row to close or update its outcome.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : runs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">RPO</TableHead>
                  <TableHead className="text-right">RTO</TableHead>
                  <TableHead>Smoke</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const smokeCount = [
                    run.db_smoke_passed,
                    run.storage_smoke_passed,
                    run.auth_smoke_passed,
                    run.edge_smoke_passed,
                    run.signed_url_smoke_passed,
                  ].filter(Boolean).length;

                  return (
                    <TableRow
                      key={run.id}
                      className={selectedRunId === run.id ? 'bg-muted/60' : 'cursor-pointer'}
                      onClick={() => setSelectedRunId(run.id)}
                    >
                      <TableCell className="whitespace-nowrap">{run.started_at ? format(new Date(run.started_at), 'PP p') : '-'}</TableCell>
                      <TableCell><Badge variant={statusVariant(run.status)}>{run.status}</Badge></TableCell>
                      <TableCell>{run.drill_type}</TableCell>
                      <TableCell className="max-w-[180px] truncate font-mono text-xs" title={run.target_project_ref || ''}>{run.target_project_ref || '-'}</TableCell>
                      <TableCell className="text-right">{run.rpo_minutes ?? '-'}</TableCell>
                      <TableCell className="text-right">{run.rto_minutes ?? '-'}</TableCell>
                      <TableCell>{smokeCount}/5</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No restore drills logged yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRestoreDrills;
