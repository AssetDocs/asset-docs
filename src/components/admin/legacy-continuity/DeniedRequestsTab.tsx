// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { REQUEST_TYPE_LABEL, RISK_BADGE_CLASS, RISK_LABEL } from './constants';

const DeniedRequestsTab: React.FC<{ onOpenCase: (id: string) => void; refreshKey: number }> = ({ onOpenCase, refreshKey }) => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('account_continuity_requests').select('*').eq('status', 'denied').order('updated_at', { ascending: false });
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
                <TableHead>Case</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Denial Reason</TableHead>
                <TableHead>Denied</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No denied requests.</TableCell></TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id.slice(0, 8)}…</TableCell>
                  <TableCell className="text-sm">{REQUEST_TYPE_LABEL[r.request_type] || r.request_type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.metadata?.denial_reason || '—'}</TableCell>
                  <TableCell className="text-sm">{new Date(r.updated_at || r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="outline" className={RISK_BADGE_CLASS[r.risk_level || 'low']}>{RISK_LABEL[r.risk_level || 'low']}</Badge></TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => onOpenCase(r.id)}>View Case</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeniedRequestsTab;
