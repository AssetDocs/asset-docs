// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EXT_STATUS_OPTIONS, EXT_STATUS_LABEL, EXT_STATUS_BADGE, EXT_REASON_LABEL } from "./externalConstants";

type Props = { requestId: string | null; onClose: () => void };

const ExternalAssistanceDialog: React.FC<Props> = ({ requestId, onClose }) => {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!requestId) { setData(null); return; }
    (async () => {
      const [r, d, m, a] = await Promise.all([
        supabase.from("external_account_assistance_requests").select("*").eq("id", requestId).maybeSingle(),
        supabase.from("external_assistance_documents").select("*").eq("request_id", requestId),
        supabase.from("external_assistance_account_matches").select("*").eq("request_id", requestId),
        supabase.from("external_assistance_audit_logs").select("*").eq("request_id", requestId).order("created_at", { ascending: false }),
      ]);
      setData(r.data);
      setDocs(d.data || []);
      setMatches(m.data || []);
      setAudit(a.data || []);
      setNewStatus(r.data?.status || "");
    })();
  }, [requestId]);

  const logAction = async (action_type: string, action_details: any = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("external_assistance_audit_logs").insert({
      request_id: requestId, actor_type: "admin", actor_id: user?.id,
      action_type, action_details,
    });
  };

  const updateStatus = async () => {
    if (!newStatus || newStatus === data.status) return;
    setSaving(true);
    const patch: any = { status: newStatus };
    if (newStatus === "preservation_hold") {
      patch.preservation_hold = true;
      patch.preservation_hold_started_at = new Date().toISOString();
      patch.preservation_hold_expires_at = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString();
    }
    if (newStatus === "completed") patch.completed_at = new Date().toISOString();
    const { error } = await supabase.from("external_account_assistance_requests").update(patch).eq("id", requestId);
    setSaving(false);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    await logAction("status_changed", { from: data.status, to: newStatus });
    toast({ title: "Status updated" });
    onClose();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await logAction("internal_note", { note: note.trim() });
    setNote("");
    const { data: a } = await supabase.from("external_assistance_audit_logs").select("*").eq("request_id", requestId).order("created_at", { ascending: false });
    setAudit(a || []);
    toast({ title: "Note added" });
  };

  if (!requestId) return null;

  return (
    <Dialog open={!!requestId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>External Assistance Request</DialogTitle>
        </DialogHeader>
        {!data ? (
          <div className="py-10 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={EXT_STATUS_BADGE[data.status]}>{EXT_STATUS_LABEL[data.status]}</Badge>
              <Badge variant="outline">Risk: {data.risk_level}</Badge>
              <Badge variant="outline">Submitted {new Date(data.submitted_at).toLocaleString()}</Badge>
            </div>

            <section>
              <h3 className="font-semibold mb-2">Requester</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-muted-foreground">Name</dt><dd>{data.requester_name}</dd></div>
                <div><dt className="text-muted-foreground">Email</dt><dd>{data.requester_email}</dd></div>
                <div><dt className="text-muted-foreground">Phone</dt><dd>{data.requester_phone || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Relationship</dt><dd>{data.requester_relationship}</dd></div>
              </dl>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Reported Account</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-muted-foreground">Account holder</dt><dd>{data.account_holder_name}</dd></div>
                <div><dt className="text-muted-foreground">Email</dt><dd>{data.account_holder_email || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Phone</dt><dd>{data.account_holder_phone || "—"}</dd></div>
              </dl>
              {data.account_holder_other_info && (
                <p className="text-sm mt-2 whitespace-pre-wrap bg-muted/40 p-3 rounded-md">{data.account_holder_other_info}</p>
              )}
              {matches.length > 0 && (
                <div className="mt-3 p-3 rounded-md border border-amber-200 bg-amber-50">
                  <p className="text-xs font-medium text-amber-900 mb-1">Internal-only: candidate account match</p>
                  {matches.map((m) => (
                    <p key={m.id} className="text-xs text-amber-900">
                      user_id {m.matched_user_id} · {m.match_confidence} · {m.match_method}
                    </p>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="font-semibold mb-2">Reason & Explanation</h3>
              <p className="text-sm"><span className="text-muted-foreground">Reason:</span> {EXT_REASON_LABEL[data.reason_for_contact] || data.reason_for_contact}</p>
              <p className="text-sm mt-2 whitespace-pre-wrap bg-muted/40 p-3 rounded-md">{data.explanation}</p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Documents ({docs.length})</h3>
              {docs.length === 0 ? <p className="text-sm text-muted-foreground">None uploaded.</p> : (
                <ul className="space-y-1 text-sm">
                  {docs.map((d) => (
                    <li key={d.id} className="border border-border rounded-md p-2">
                      <div className="flex justify-between">
                        <span>{d.document_category}: {d.file_name}</span>
                        <Badge variant="outline">{d.verification_status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{d.file_path}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="border-t border-border pt-4">
              <h3 className="font-semibold mb-2">Admin Review</h3>
              <div className="flex gap-2 items-end mb-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Update status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXT_STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{EXT_STATUS_LABEL[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={updateStatus} disabled={saving || newStatus === data.status}>Apply</Button>
              </div>
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note…" />
              <Button size="sm" variant="outline" className="mt-2" onClick={addNote} disabled={!note.trim()}>Add internal note</Button>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Audit Log</h3>
              <ul className="space-y-1 text-xs max-h-64 overflow-y-auto">
                {audit.map((a) => (
                  <li key={a.id} className="border border-border rounded-md p-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{a.action_type}</span>
                      <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground">{a.actor_type}{a.actor_id ? ` · ${a.actor_id.slice(0, 8)}` : ""}</p>
                    {a.action_details && Object.keys(a.action_details).length > 0 && (
                      <pre className="text-[10px] mt-1 whitespace-pre-wrap">{JSON.stringify(a.action_details, null, 2)}</pre>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExternalAssistanceDialog;
