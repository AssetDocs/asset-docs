import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Heart, ShieldCheck, Upload, X, CheckCircle2 } from "lucide-react";

const RELATIONSHIPS = [
  { v: "spouse", l: "Spouse" }, { v: "child", l: "Child" }, { v: "parent", l: "Parent" },
  { v: "sibling", l: "Sibling" }, { v: "executor", l: "Executor" }, { v: "caregiver", l: "Caregiver" },
  { v: "attorney", l: "Attorney" }, { v: "friend", l: "Friend" }, { v: "other", l: "Other" },
];
const REASONS = [
  { v: "billing", l: "Billing concern" },
  { v: "closure_inquiry", l: "Account closure inquiry" },
  { v: "deceased", l: "Deceased account holder" },
  { v: "incapacitated", l: "Incapacitated account holder" },
  { v: "continuity_support", l: "Continuity or preservation support" },
  { v: "memorialization", l: "Memorialization inquiry" },
  { v: "export_inquiry", l: "Export inquiry" },
  { v: "unsure", l: "Unsure / need assistance" },
];
const DOC_CATEGORIES = [
  "Obituary", "Death certificate", "Power of attorney", "Guardianship document",
  "Court document", "Billing statement", "Other supporting documentation",
];

type PendingDoc = { file: File; document_category: string };
type UploadedDoc = { file_name: string; file_path: string; file_size: number; file_type: string; document_category: string };
type AcknowledgementKey = "manual_review" | "no_access_granted" | "no_confirmation" | "accurate";
type AssistanceSubmissionResponse = {
  reference?: string | null;
  submission_token?: string | null;
};

const ACKNOWLEDGEMENTS: Array<[AcknowledgementKey, string]> = [
  ["manual_review", "I understand this request will be manually reviewed by Asset Safe."],
  ["no_access_granted", "I understand this form does not grant account access, export access, or closure authority."],
  ["no_confirmation", "I understand Asset Safe cannot confirm account existence through this form."],
  ["accurate", "I confirm the information submitted is accurate to the best of my knowledge."],
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Please try again.";
}

const AccountAssistance: React.FC = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const [form, setForm] = useState({
    requester_name: "", requester_email: "", requester_phone: "", requester_relationship: "",
    account_holder_name: "", account_holder_email: "", account_holder_phone: "", account_holder_other_info: "",
    reason_for_contact: "", explanation: "",
  });
  const [ack, setAck] = useState({ manual_review: false, no_access_granted: false, no_confirmation: false, accurate: false });
  const [docs, setDocs] = useState<PendingDoc[]>([]);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum 15MB per file.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      setDocs((p) => [...p, { file, document_category: category }]);
    } catch (err: unknown) {
      toast({ title: "File could not be added", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const allAck = ack.manual_review && ack.no_access_granted && ack.no_confirmation && ack.accurate;
  const canSubmit = form.requester_name && form.requester_email && form.requester_relationship
    && form.account_holder_name && form.reason_for_contact && form.explanation && allAck;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    let requestId: string | null = null;
    try {
      const { data, error } = await supabase.functions.invoke("submit-account-assistance", {
        body: { ...form, acknowledgements: ack, documents: [] },
      });
      if (error) throw error;
      const response = data as AssistanceSubmissionResponse | null;
      requestId = response?.reference || null;
      const submissionToken = response?.submission_token || null;

      if (requestId && submissionToken && docs.length > 0) {
        const uploadedDocs: UploadedDoc[] = [];

        for (const doc of docs.slice(0, 10)) {
          const ext = doc.file.name.split(".").pop() || "bin";
          const path = `submission/${requestId}/${submissionToken}/${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("external-assistance-docs")
            .upload(path, doc.file, { contentType: doc.file.type });
          if (uploadError) throw uploadError;

          uploadedDocs.push({
            file_name: doc.file.name,
            file_path: path,
            file_size: doc.file.size,
            file_type: doc.file.type,
            document_category: doc.document_category,
          });
        }

        if (uploadedDocs.length > 0) {
          const { error: docError } = await supabase
            .from("external_assistance_documents" as any)
            .insert(uploadedDocs.map((doc) => ({ ...doc, request_id: requestId, submission_token: submissionToken })));
          if (docError) throw docError;
        }
      }

      setSubmitted(requestId || "received");
    } catch (err: unknown) {
      if (requestId) {
        toast({
          title: "Request received",
          description: "Your request was submitted, but one or more documents could not be attached. Support may contact you if needed.",
        });
        setSubmitted(requestId);
        return;
      }
      toast({ title: "Submission failed", description: "Please try again or email support@assetsafe.net.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <SEOHead title="Request Received | Asset Safe" description="Your account assistance request has been received." canonicalUrl="https://getassetsafe.com/account-assistance" />
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16 max-w-2xl">
          <Card className="border-border">
            <CardContent className="p-10 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Request Received</h1>
              <p className="text-muted-foreground">
                Thank you. Your request has been received and will be reviewed by the Asset Safe team.
                If additional information is needed, our team may contact you using the information provided.
              </p>
              <div className="pt-4">
                <Button asChild variant="outline"><Link to="/">Return Home</Link></Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SEOHead
        title="Continuity & Account Assistance | Asset Safe"
        description="If you need help regarding the account of a family member or loved one, the Asset Safe team can assist with continuity, preservation, billing, or account closure-related requests."
        canonicalUrl="https://getassetsafe.com/account-assistance"
      />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10 max-w-3xl">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link to="/contact"><ChevronLeft className="h-4 w-4 mr-1" />Back to Contact</Link>
        </Button>

        {/* Hero */}
        <div className="text-center mb-10 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Heart className="h-6 w-6 text-brand-blue" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Continuity & Account Assistance</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            If you need help regarding the account of a family member or loved one, the Asset Safe team can assist
            with continuity, preservation, billing, or account closure-related requests.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Section 1 */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Your Information</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label>Full name *</Label><Input value={form.requester_name} onChange={set("requester_name")} required /></div>
              <div><Label>Email address *</Label><Input type="email" value={form.requester_email} onChange={set("requester_email")} required /></div>
              <div><Label>Phone number</Label><Input type="tel" value={form.requester_phone} onChange={set("requester_phone")} /></div>
              <div>
                <Label>Relationship to account holder *</Label>
                <Select value={form.requester_relationship} onValueChange={(v) => setForm((p) => ({ ...p, requester_relationship: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                  <SelectContent>{RELATIONSHIPS.map((r) => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Account holder full name *</Label><Input value={form.account_holder_name} onChange={set("account_holder_name")} required /></div>
                <div><Label>Account holder email</Label><Input type="email" value={form.account_holder_email} onChange={set("account_holder_email")} /></div>
                <div><Label>Account holder phone</Label><Input type="tel" value={form.account_holder_phone} onChange={set("account_holder_phone")} /></div>
              </div>
              <div>
                <Label>Any other identifying information</Label>
                <Textarea rows={3} value={form.account_holder_other_info} onChange={set("account_holder_other_info")} />
                <p className="text-xs text-muted-foreground mt-1">
                  Please provide any information that may help our team review your request. Asset Safe will not confirm
                  account details through this form.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Reason for Contact</CardTitle></CardHeader>
            <CardContent>
              <Label>What best describes your request? *</Label>
              <Select value={form.reason_for_contact} onValueChange={(v) => setForm((p) => ({ ...p, reason_for_contact: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>{REASONS.map((r) => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">How can we help?</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={5} value={form.explanation} onChange={set("explanation")} required maxLength={5000}
                placeholder="Briefly describe the situation and what kind of assistance you are requesting." />
              <p className="text-xs text-muted-foreground mt-1">
                Briefly describe the situation and what kind of assistance you are requesting.
              </p>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-border">
            <CardHeader><CardTitle className="text-lg">Optional Documentation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Documentation is optional at this stage. Asset Safe may request additional verification before taking any
                account-related action.
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {DOC_CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 border border-border rounded-md p-3 cursor-pointer hover:bg-muted/40">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1">{cat}</span>
                    <input type="file" className="hidden" onChange={(e) => handleUpload(e, cat)}
                      accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx" />
                  </label>
                ))}
              </div>
              {uploading && <p className="text-xs text-muted-foreground">Adding file...</p>}
              {docs.length > 0 && (
                <ul className="space-y-1">
                  {docs.map((d, i) => (
                    <li key={i} className="flex items-center justify-between text-sm border border-border rounded-md px-3 py-2">
                      <span className="truncate">{d.document_category}: {d.file.name}</span>
                      <button type="button" onClick={() => setDocs((p) => p.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" /> Acknowledgement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ACKNOWLEDGEMENTS.map(([k, l]) => (
                <label key={k} className="flex items-start gap-3 text-sm">
                  <Checkbox checked={ack[k]} onCheckedChange={(v) => setAck((p) => ({ ...p, [k]: !!v }))} />
                  <span>{l}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" disabled={!canSubmit || submitting} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white">
            {submitting ? "Submitting..." : "Submit Assistance Request"}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AccountAssistance;
