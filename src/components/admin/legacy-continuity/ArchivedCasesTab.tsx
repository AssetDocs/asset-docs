// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { REQUEST_TYPE_LABEL, STATUS_LABEL } from './constants';

const ArchivedCasesTab: React.FC<{ onOpenCase: (id: string) => void; refreshKey: number }> = ({ onOpenCase, refreshKey }) => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('account_continuity_requests').select('*')
        .in('status', ['completed', 'archived']).order('updated_at', { ascending: false });
      setRows(data || []);
    })();
  }, [refreshKey]);

  return (
    <Card className="border-border mt-4">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-3">Archived cases are read-only. All actions are preserved in the audit log.</p>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No archived cases.</TableCell></TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id.slice(0, 8)}…</TableCell>
                  <TableCell className="text-sm">{STATUS_LABEL[r.status]}</TableCell>
                  <TableCell className="text-sm">{REQUEST_TYPE_LABEL[r.request_type] || r.request_type}</TableCell>
                  <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => onOpenCase(r.id)}>View Archive</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedCasesTab;
