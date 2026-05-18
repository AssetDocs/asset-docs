// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

const AuditLogTab: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('continuity_audit_logs').select('*').order('created_at', { ascending: false }).limit(500);
      setRows(data || []);
    })();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const s = search.toLowerCase();
    return rows.filter((r) =>
      (r.action_type || '').toLowerCase().includes(s)
      || (r.request_id || '').includes(s)
      || (r.admin_user_id || '').includes(s)
    );
  }, [rows, search]);

  return (
    <Card className="border-border mt-4">
      <CardContent className="p-4 space-y-3">
        <Input placeholder="Filter by action, case ID, or admin user ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No audit entries.</TableCell></TableRow>
              )}
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{r.admin_user_id?.slice(0, 8)}…</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{r.admin_role || '—'}</Badge></TableCell>
                  <TableCell className="text-sm font-medium">{r.action_type}</TableCell>
                  <TableCell className="font-mono text-xs">{r.request_id ? `${r.request_id.slice(0, 8)}…` : '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                    {r.action_details && Object.keys(r.action_details).length ? JSON.stringify(r.action_details) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogTab;
