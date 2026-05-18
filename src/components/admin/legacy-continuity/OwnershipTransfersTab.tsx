// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { TRANSFER_STATUS_BADGE, TRANSFER_STATUS_LABEL } from './constants';

const OwnershipTransfersTab: React.FC<{ onOpenCase: (id: string) => void; refreshKey: number }> = ({ onOpenCase, refreshKey }) => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('continuity_ownership_transfers').select('*').order('created_at', { ascending: false });
      setRows(data || []);
    })();
  }, [refreshKey]);

  return (
    <Card className="border-border mt-4">
      <CardContent className="p-4">
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Current Owner</TableHead>
                <TableHead>Proposed Owner</TableHead>
                <TableHead>Recommended By</TableHead>
                <TableHead>Senior Approver</TableHead>
                <TableHead>Invitation</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">No ownership transfers in review.</TableCell></TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Badge variant="outline" className={TRANSFER_STATUS_BADGE[r.status]}>{TRANSFER_STATUS_LABEL[r.status]}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.request_id.slice(0, 8)}…</TableCell>
                  <TableCell className="font-mono text-xs">{r.current_owner_id?.slice(0, 8)}…</TableCell>
                  <TableCell className="font-mono text-xs">{r.proposed_owner_id?.slice(0, 8)}…</TableCell>
                  <TableCell className="font-mono text-xs">{r.recommended_by?.slice(0, 8)}…</TableCell>
                  <TableCell className="font-mono text-xs">{r.senior_approved_by ? `${r.senior_approved_by.slice(0, 8)}…` : '—'}</TableCell>
                  <TableCell className="text-xs">{r.invitation_sent_at ? 'Sent' : '—'}{r.accepted_at ? ' · Accepted' : ''}</TableCell>
                  <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => onOpenCase(r.request_id)}>Open Case</Button>
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

export default OwnershipTransfersTab;
