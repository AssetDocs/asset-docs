// @ts-nocheck
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, Upload, X, FileText, Info, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';
import {
  REQUEST_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  DOCUMENT_CATEGORIES,
  REQUESTED_OUTCOMES,
  REQUEST_TYPE_LABEL,
  ContinuityRequestType,
} from './types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  legacyAdminId: string | null;
  onSubmitted: () => void;
}

interface PendingDoc {
  file: File;
  category: string;
}

const TOTAL_STEPS = 6;

const ContinuityRequestWizard: React.FC<Props> = ({ open, onOpenChange, legacyAdminId, onSubmitted }) => {
  const { user } = useAuth();
  const { accountId } = useAccount();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [requestType, setRequestType] = useState<ContinuityRequestType | ''>('');
  // Step 2
  const [relationship, setRelationship] = useState('');
  const [legalAuth, setLegalAuth] = useState<'yes' | 'no' | 'unsure' | ''>('');
  const [passedAway, setPassedAway] = useState<'yes' | 'no' | 'unsure' | ''>('');
  // Step 3
  const [situation, setSituation] = useState('');
  // Step 4
  const [docs, setDocs] = useState<PendingDoc[]>([]);
  // Step 5
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [outcomeOther, setOutcomeOther] = useState('');
  // Step 6
  const [ack, setAck] = useState({ a: false, b: false, c: false, d: false, e: false });

  const reset = () => {
    setStep(1); setRequestType(''); setRelationship(''); setLegalAuth(''); setPassedAway('');
    setSituation(''); setDocs([]); setOutcomes([]); setOutcomeOther('');
    setAck({ a: false, b: false, c: false, d: false, e: false });
    setSubmitted(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      onOpenChange(false);
      setTimeout(reset, 200);
    } else {
      onOpenChange(true);
    }
  };

  const allAck = Object.values(ack).every(Boolean);

  const canContinue = () => {
    switch (step) {
      case 1: return !!requestType;
      case 2: return !!relationship && !!legalAuth && !!passedAway;
      case 3: return situation.trim().length >= 20;
      case 4: return true; // docs optional
      case 5: return outcomes.length > 0 && (!outcomes.includes('other') || outcomeOther.trim().length > 0);
      case 6: return allAck;
      default: return false;
    }
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map(f => ({ file: f, category: DOCUMENT_CATEGORIES[0] }));
    setDocs(d => [...d, ...next]);
  };

  const toggleOutcome = (v: string) => {
    setOutcomes(o => o.includes(v) ? o.filter(x => x !== v) : [...o, v]);
  };

  const handleSubmit = async () => {
    if (!user || !accountId || !requestType) return;
    setSubmitting(true);
    try {
      const metadata = {
        relationship,
        legal_authorization: legalAuth,
        passed_away: passedAway,
        requested_outcomes: outcomes,
        outcome_other: outcomes.includes('other') ? outcomeOther.trim() : null,
        documents: [] as { name: string; category: string; path: string; size: number }[],
      };

      // Insert the request first
      const { data: inserted, error: insErr } = await supabase
        .from('account_continuity_requests')
        .insert({
          account_id: accountId,
          requested_by_user_id: user.id,
          legacy_admin_id: legacyAdminId,
          request_type: requestType,
          reason: situation.trim(),
          status: 'submitted',
          metadata,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      // Upload supporting documents
      const uploaded: typeof metadata.documents = [];
      for (const d of docs) {
        const safeName = d.file.name.replace(/[^\w.\-]+/g, '_');
        const path = `${accountId}/${inserted.id}/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from('continuity-documents')
          .upload(path, d.file, { upsert: false, contentType: d.file.type || undefined });
        if (!upErr) {
          uploaded.push({ name: d.file.name, category: d.category, path, size: d.file.size });
        } else {
          console.warn('upload failed', d.file.name, upErr);
        }
      }

      if (uploaded.length) {
        await supabase
          .from('account_continuity_requests')
          .update({ metadata: { ...metadata, documents: uploaded } })
          .eq('id', inserted.id);
      }

      // Fire-and-forget staff notification (legacy support email digest)
      try {
        await supabase.functions.invoke('notify-continuity-request', {
          body: { request_id: inserted.id },
        });
      } catch (e) { console.warn('notify failed', e); }

      // Owner + Legacy Admin continuity notifications (audit-logged, idempotent)
      try {
        const { notifyContinuityEvent } = await import('@/lib/continuityNotifications');
        await notifyContinuityEvent(inserted.id, 'request_submitted');
      } catch (e) { console.warn('continuity-notify failed', e); }

      setSubmitted(true);
      onSubmitted();
    } catch (err: any) {
      toast({ title: 'Could not submit request', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderConfirmation = () => (
    <div className="py-6 text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold">Request Submitted for Review</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Your continuity request has been securely submitted to Asset Safe for manual review.
        A member of our team may contact you for additional verification or documentation before
        any action is taken.
      </p>
      <div className="flex items-center justify-center gap-2 pt-2">
        <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">Under Review</Badge>
      </div>
      <p className="text-xs text-muted-foreground">Estimated review time: 2–5 business days</p>
      <div className="pt-4">
        <Button onClick={() => handleClose(false)}>Close</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            Continuity Request
          </DialogTitle>
          {!submitted && (
            <DialogDescription>
              This request will be manually reviewed by Asset Safe. No account access, ownership, export,
              or closure occurs automatically.
            </DialogDescription>
          )}
        </DialogHeader>

        {submitted ? renderConfirmation() : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Step {step} of {TOTAL_STEPS}</span>
              </div>
              <Progress value={(step / TOTAL_STEPS) * 100} className="h-1" />
            </div>

            <div className="py-2 space-y-4">
              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="font-medium">What type of continuity request are you submitting?</h3>
                  <RadioGroup value={requestType} onValueChange={(v) => setRequestType(v as any)} className="space-y-2">
                    {REQUEST_TYPE_OPTIONS.map(opt => (
                      <label
                        key={opt.value}
                        htmlFor={`rt-${opt.value}`}
                        className={`flex gap-3 border rounded-md p-3 cursor-pointer transition-colors ${requestType === opt.value ? 'border-foreground bg-muted/40' : 'hover:bg-muted/30'}`}
                      >
                        <RadioGroupItem value={opt.value} id={`rt-${opt.value}`} className="mt-1" />
                        <div>
                          <div className="text-sm font-medium">{opt.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Relationship Verification</h3>
                  <div className="space-y-2">
                    <Label>Relationship to account holder</Label>
                    <Select value={relationship} onValueChange={setRelationship}>
                      <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Are you legally authorized to act on behalf of the account holder?</Label>
                    <RadioGroup value={legalAuth} onValueChange={(v) => setLegalAuth(v as any)} className="flex gap-4">
                      {['yes', 'no', 'unsure'].map(v => (
                        <label key={v} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                          <RadioGroupItem value={v} id={`la-${v}`} /> {v}
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Has the account holder passed away?</Label>
                    <RadioGroup value={passedAway} onValueChange={(v) => setPassedAway(v as any)} className="flex gap-4">
                      {['yes', 'no', 'unsure'].map(v => (
                        <label key={v} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                          <RadioGroupItem value={v} id={`pa-${v}`} /> {v}
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                  {(legalAuth === 'yes' || passedAway === 'yes') && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        You will be asked to upload supporting documentation in a later step. Asset Safe
                        requires documentation before approving any continuity action.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Please explain the situation requiring this request.</h3>
                  <Textarea
                    rows={7}
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="Include relevant context, timeline, and why this request is being submitted…"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include relevant context, timeline, and why this continuity request is being submitted.
                    This information will be reviewed by Asset Safe.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Supporting Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Asset Safe may require documentation before approving any continuity action. All
                    submissions are reviewed manually.
                  </p>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-6 cursor-pointer hover:bg-muted/30">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-sm">Click to upload documents</span>
                    <span className="text-xs text-muted-foreground">PDF, images, or document files</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ''; }}
                    />
                  </label>
                  {docs.length > 0 && (
                    <div className="space-y-2">
                      {docs.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 border rounded-md p-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{d.file.name}</div>
                            <div className="text-xs text-muted-foreground">{(d.file.size / 1024).toFixed(0)} KB</div>
                          </div>
                          <Select value={d.category} onValueChange={(v) => setDocs(arr => arr.map((x, idx) => idx === i ? { ...x, category: v } : x))}>
                            <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {DOCUMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" onClick={() => setDocs(arr => arr.filter((_, idx) => idx !== i))}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-3">
                  <h3 className="font-medium">What action are you requesting Asset Safe to review?</h3>
                  <div className="space-y-2">
                    {REQUESTED_OUTCOMES.map(o => (
                      <label key={o.value} className="flex items-start gap-2 text-sm cursor-pointer">
                        <Checkbox checked={outcomes.includes(o.value)} onCheckedChange={() => toggleOutcome(o.value)} className="mt-0.5" />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>
                  {outcomes.includes('other') && (
                    <div className="space-y-1">
                      <Label className="text-xs">Please describe</Label>
                      <Input value={outcomeOther} onChange={(e) => setOutcomeOther(e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Review and Acknowledgement</h3>
                  <div className="border rounded-md p-3 text-xs space-y-1 bg-muted/30">
                    <div><span className="text-muted-foreground">Request type:</span> {REQUEST_TYPE_LABEL[requestType]}</div>
                    <div><span className="text-muted-foreground">Relationship:</span> {relationship}</div>
                    <div><span className="text-muted-foreground">Legal authorization:</span> {legalAuth}</div>
                    <div><span className="text-muted-foreground">Account holder passed away:</span> {passedAway}</div>
                    <div><span className="text-muted-foreground">Documents:</span> {docs.length}</div>
                    <div><span className="text-muted-foreground">Requested outcomes:</span> {outcomes.join(', ') || 'none'}</div>
                  </div>
                  <div className="space-y-2">
                    {[
                      ['a', 'I confirm the information submitted is accurate to the best of my knowledge.'],
                      ['b', 'I understand Asset Safe will manually review this request before taking any action.'],
                      ['c', 'I understand additional verification or documentation may be required.'],
                      ['d', 'I understand submission does not guarantee approval.'],
                      ['e', 'I confirm I am authorized, or believe I am authorized, to submit this request.'],
                    ].map(([k, text]) => (
                      <label key={k} className="flex items-start gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={(ack as any)[k]}
                          onCheckedChange={(v) => setAck(prev => ({ ...prev, [k]: !!v }))}
                          className="mt-0.5"
                        />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex sm:justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => step === 1 ? handleClose(false) : setStep(s => s - 1)}
                disabled={submitting}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              {step < TOTAL_STEPS ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canContinue()}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canContinue() || submitting}>
                  {submitting ? 'Submitting…' : 'Submit Continuity Request'}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContinuityRequestWizard;
