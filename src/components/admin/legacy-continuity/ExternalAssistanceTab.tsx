// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import ExternalAssistanceDialog from "./ExternalAssistanceDialog";
import { EXT_STATUS_LABEL, EXT_STATUS_BADGE, EXT_REASON_LABEL } from "./externalConstants";

const terminalStatuses = ["denied", "completed", "archived"];

const ExternalAssistanceTab: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [innerKey, setInnerKey] = useState(0);

  const ageHours = (submittedAt: string) => (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);
  const ageLabel = (submittedAt: string) => {
    const hours = ageHours(submittedAt);
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };
  const activeRows = rows.filter((r) => !terminalStatuses.includes(r.status));
  const oldestActiveHours = activeRows.length ? Math.max(...activeRows.map((r) => ageHours(r.submitted_at))) : null;
  const highRiskActive = activeRows.filter((r) => ["elevated", "critical"].includes(r.risk_level)).length;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("external_account_assistance_requests")
        .select("*")
        .order("submitted_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    })();
  }, [refreshKey, innerKey]);

  return (
    <>
      <Card className="border-border mt-4">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-md border border-border p-3">
              <div className="text-xs text-muted-foreground">Active Requests</div>
              <div className="text-2xl font-semibold">{activeRows.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="text-xs text-muted-foreground">High Risk</div>
              <div className="text-2xl font-semibold">{highRiskActive}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="text-xs text-muted-foreground">Oldest Active</div>
              <div className="text-2xl font-semibold">
                {oldestActiveHours == null ? "-" : oldestActiveHours < 24 ? `${oldestActiveHours.toFixed(1)}h` : `${(oldestActiveHours / 24).toFixed(1)}d`}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-6">Loading...</TableCell></TableRow>
                )}
                {!loading && rows.length === 0 && (
                  <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-6">No external assistance requests yet.</TableCell></TableRow>
                )}
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline" className={EXT_STATUS_BADGE[r.status] || ""}>{EXT_STATUS_LABEL[r.status] || r.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{r.risk_level}</Badge></TableCell>
                    <TableCell className="text-sm">External Assistance Request</TableCell>
                    <TableCell className="text-sm">{r.requester_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.requester_email}</TableCell>
                    <TableCell className="text-sm">{r.requester_relationship}</TableCell>
                    <TableCell className="text-sm">{EXT_REASON_LABEL[r.reason_for_contact] || r.reason_for_contact}</TableCell>
                    <TableCell className="text-sm">{new Date(r.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className={ageHours(r.submitted_at) >= 72 && !terminalStatuses.includes(r.status) ? "bg-amber-50 text-amber-900 border-amber-200" : ""}>
                        {ageLabel(r.submitted_at)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setOpenId(r.id)}>Review Case</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ExternalAssistanceDialog
        requestId={openId}
        onClose={() => { setOpenId(null); setInnerKey((k) => k + 1); }}
      />
    </>
  );
};

export default ExternalAssistanceTab;
