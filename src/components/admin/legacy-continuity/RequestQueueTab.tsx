// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import {
  STATUS_LABEL, STATUS_BADGE_CLASS, STATUS_OPTIONS,
  RISK_LEVELS, RISK_LABEL, RISK_BADGE_CLASS, REQUEST_TYPE_LABEL,
} from './constants';

type Props = { onOpenCase: (id: string) => void; refreshKey: number; activeOnly?: boolean };

const ACTIVE_STATUSES = ['submitted', 'under_review', 'needs_documentation', 'escalated'];

const RequestQueueTab: React.FC<Props> = ({ onOpenCase, refreshKey, activeOnly }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [typeF, setTypeF] = useState('all');
  const [riskF, setRiskF] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('account_continuity_requests').select('*').order('created_at', { ascending: false });
      if (activeOnly) q = q.in('status', ACTIVE_STATUSES);
      const { data } = await q;
      setRows(data || []);
      const ids = Array.from(new Set([
        ...(data || []).map((r: any) => r.requested_by_user_id).filter(Boolean),
        ...(data || []).map((r: any) => r.account_id).filter(Boolean),
      ]));
      if (ids.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, account_number')
          .in('user_id', ids);
        const map: Record<string, any> = {};
        (profs || []).forEach((p: any) => { map[p.user_id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, [refreshKey, activeOnly]);

  const filtered = useMemo(() => {
    let f = rows;
    if (statusF !== 'all') f = f.filter((r) => r.status === statusF);
    if (typeF !== 'all') f = f.filter((r) => r.request_type === typeF);
    if (riskF !== 'all') f = f.filter((r) => (r.risk_level || 'low') === riskF);
    if (search.trim()) {
      const s = search.toLowerCase();
      f = f.filter((r) => {
        const lp = profiles[r.requested_by_user_id];
        const name = lp ? `${lp.first_name || ''} ${lp.last_name || ''}` : '';
        return name.toLowerCase().includes(s) || (r.id || '').includes(s);
      });
    }
    f = [...f].sort((a: any, b: any) => {
      if (sortBy === 'risk_level') {
        const order = { critical: 0, elevated: 1, moderate: 2, low: 3 } as any;
        return (order[a.risk_level || 'low'] ?? 3) - (order[b.risk_level || 'low'] ?? 3);
      }
      const av = a[sortBy] || a.created_at;
      const bv = b[sortBy] || b.created_at;
      return (bv > av ? 1 : -1);
    });
    return f;
  }, [rows, statusF, typeF, riskF, search, sortBy, profiles]);

  return (
    <Card className="border-border mt-4">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Input placeholder="Search account holder, legacy admin, or case ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeF} onValueChange={setTypeF}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Request Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(REQUEST_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={riskF} onValueChange={setRiskF}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              {RISK_LEVELS.map((r) => <SelectItem key={r} value={r}>{RISK_LABEL[r]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Submitted Date</SelectItem>
              <SelectItem value="updated_at">Last Updated</SelectItem>
              <SelectItem value="risk_level">Risk Level</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Account Holder</TableHead>
                <TableHead>Legacy Admin</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">No continuity requests match these filters.</TableCell></TableRow>
              )}
              {filtered.map((r) => {
                const lp = profiles[r.requested_by_user_id];
                const legacyName = lp ? `${lp.first_name || ''} ${lp.last_name || ''}`.trim() || lp.account_number : '—';
                return (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline" className={STATUS_BADGE_CLASS[r.status] || ''}>{STATUS_LABEL[r.status] || r.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={RISK_BADGE_CLASS[r.risk_level || 'low']}>{RISK_LABEL[r.risk_level || 'low']}</Badge></TableCell>
                    <TableCell className="text-sm">{REQUEST_TYPE_LABEL[r.request_type] || r.request_type}</TableCell>
                    <TableCell className="text-sm font-mono text-xs">{r.account_id?.slice(0, 8)}…</TableCell>
                    <TableCell className="text-sm">{legacyName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.metadata?.relationship || '—'}</TableCell>
                    <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{new Date(r.updated_at || r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => onOpenCase(r.id)}>Review Case</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestQueueTab;
